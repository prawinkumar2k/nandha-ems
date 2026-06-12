import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatCountdown } from "@/core/utils/helpers";
import { useCountdown } from "@/core/hooks/useUtils";
import { ROUTES } from "@/core/constants/routes";
import { apiClient } from "@/core/api/client";
import { AlertTriangle, CheckCircle2, Clock, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSocket } from "@/contexts/SocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { OfflineCodeEditor } from "@/shared/components/Coding/OfflineCodeEditor";


// ─── Question Types ─────────────────────────────────────────────────────────
const QUESTION_TYPES = {
  MCQ: "mcq",
  CODING: "coding",
  TEXT: "text",
  MATH: "math",
};

export default function ExamInterface() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const socket = useSocket();
  const { user } = useAuth();


  const [submissionId, setSubmissionId] = useState(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem(`exam_backup_${examId}`);
    return saved ? JSON.parse(saved) : {};
  });
  const [networkStatus, setNetworkStatus] = useState("online");
  const [lastSynced, setLastSynced] = useState(null);
  const [flagged, setFlagged] = useState(new Set());
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [violationLog, setViolationLog] = useState([]);
  const [warningMsg, setWarningMsg] = useState("");
  const violationCountRef = useRef(0);
  const syncTimeoutRef = useRef(null);
  const monitorVideoRef = useRef(null);
  const isMonitoringStarted = useRef(false);



  // ─── Data Loading & Session Initialization ────────────────
  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        // 1. Fetch Exam Details
        const examData = await apiClient.get(`/api/exams/${examId}`);
        setExam(examData);
        
        // 2. Start/Resume Submission Session
        const sessionData = await apiClient.post("/api/submissions/start", { examId });
        setSubmissionId(sessionData._id);
        
        // Restore existing violations if any
        if (sessionData.violations) {
          setViolationLog(sessionData.violations);
          setViolations(sessionData.totalViolations || 0);
          violationCountRef.current = sessionData.totalViolations || 0;
        }

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, [examId]);

  const questions = exam?.questions || [];

  // ─── Cloud Sync ──────────────────────────────────────────
  const syncToCloud = useCallback(async (currentAnswers, currentViolations = null) => {
    if (!submissionId) return;
    try {
      setNetworkStatus("syncing");
      await apiClient.put(`/api/submissions/${submissionId}/answers`, { 
        answers: currentAnswers,
        violations: currentViolations || violationLog 
      });
      setLastSynced(new Date());
      setNetworkStatus("online");
    } catch (err) {
      console.error("Save failed:", err.message);
      setNetworkStatus("offline");
    }
  }, [submissionId, violationLog]);

  // Auto-save every 5 seconds
  useEffect(() => {
    localStorage.setItem(`exam_backup_${examId}`, JSON.stringify(answers));
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      syncToCloud(answers);
    }, 5000);

    return () => clearTimeout(syncTimeoutRef.current);
  }, [answers, examId, syncToCloud]);

  // ─── Timer (60 min) ───────────────────────────────────────────────────
  const durationInSeconds = (exam?.duration || 60) * 60;
  const { remaining } = useCountdown(durationInSeconds, () => handleSubmit("time_out"));

  const pct = Math.round((remaining / durationInSeconds) * 100);
  const timeColor = remaining < 300 ? "text-rose-500" : remaining < 600 ? "text-amber-500" : "text-foreground";

  // ─── Security Alerts ──────────────────────────────────────────────
  const logViolation = useCallback(async (type) => {
    violationCountRef.current += 1;
    setViolations(violationCountRef.current);
    
    // Capture evidence if video is available
    let screenshot = "";
    if (monitorVideoRef.current && monitorVideoRef.current.readyState === monitorVideoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(monitorVideoRef.current, 0, 0, canvas.width, canvas.height);
      screenshot = canvas.toDataURL("image/jpeg", 0.4); // 40% quality to keep size low
    }

    const event = { type, time: new Date().toISOString(), screenshot };
    
    setViolationLog((p) => {
      const next = [...p, event];
      // Sync with submission record
      if (submissionId) {
        apiClient.put(`/api/submissions/${submissionId}/answers`, { 
          violations: next 
        }).catch(() => {});
        
        // POST to dedicated violations API for real-time alerting
        apiClient.post("/api/violations", {
          examId,
          type,
          screenshot,
          severity: "medium"
        }).catch(err => console.error("Real-time alert failed:", err));
      }
      return next;
    });

    setWarningMsg(`⚠️ ALERT: ${type.replace('_', ' ').toUpperCase()} detected! Your teacher has been notified.`);
    setTimeout(() => setWarningMsg(""), 5000);
    
    if (violationCountRef.current >= (exam?.security?.maxViolations || 10)) {
      toast.error("TEST STOPPED: Too many rules broken.");
      handleSubmit("too_many_violations");
    }
  }, [submissionId, exam, examId, toast]);


  useEffect(() => {
    if (submitted) return;

    // Window Status
    const handleOnline = () => setNetworkStatus("online");
    const handleOffline = () => setNetworkStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // devtools detection (basic)
    const detectDevTools = () => {
      if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
         logViolation("tools_open");
      }
    };
    const dtInterval = setInterval(detectDevTools, 2000);

    // Block copy/paste
    const block = (e) => { e.preventDefault(); logViolation("copy_paste"); };
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("contextmenu", block);

    // Tab Switching
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
         logViolation("switched_tab");
         apiClient.post("/api/lab/logs", { type: "cheating_alert", details: "Tab switch detected" });
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(dtInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [submitted, logViolation]);

  const streamRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);

  // ─── Live Screen Monitoring (Stream Management) ──────────────────────────────
  useEffect(() => {
    if (submitted || !examId || !user || error || streamRef.current?.active) return;

    const initStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { 
            displaySurface: "monitor",
            width: { max: 480 },
            height: { max: 270 },
            frameRate: { max: 10 }
          },
          audio: false
        });

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        
        if (settings.displaySurface && settings.displaySurface !== 'monitor') {
          stream.getTracks().forEach(t => t.stop());
          toast.error("SECURITY ALERT: You MUST share your ENTIRE SCREEN!");
          return;
        }

        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();
        monitorVideoRef.current = video;
        streamRef.current = stream;

        // Immediate first snapshot for "Recorded Video" evidence
        setTimeout(() => {
          if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
            const canvas = document.createElement("canvas");
            canvas.width = 640; canvas.height = 360;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            apiClient.post("/api/violations", {
              examId, type: "periodic_snapshot", message: "Session Started", screenshot: canvas.toDataURL("image/jpeg", 0.5), severity: "low"
            }).catch(() => {});
          }
        }, 2000);

        // Stop if user stops sharing manually
        videoTrack.onended = () => {
          logViolation("screen_share_stopped");
          toast.error("Screen sharing is REQUIRED!");
          streamRef.current = null;
          setStreamActive(false);
        };
        setStreamActive(true);
      } catch (err) {
        console.error("Failed to start stream:", err);
        logViolation("screen_share_denied");
      }
    };

    initStream();

    return () => {
      // We only stop the stream if the component actually unmounts or exam finishes
      if (submitted && streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [examId, user, submitted, logViolation, toast, error]);

  // ─── Socket Synchronization Loop ───────────────────────────────────────────
  useEffect(() => {
    if (!socket || !streamActive || !streamRef.current?.active || submitted) return;
    
    // Safety check: wait for video object to be assigned
    if (!monitorVideoRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const video = monitorVideoRef.current;

    let lastPeriodicShot = Date.now();
    const interval = setInterval(() => {
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        // 1. Live Feed (Optimized for clarity)
        canvas.width = 640; 
        canvas.height = 360;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const midResFrame = canvas.toDataURL("image/jpeg", 0.6); // Increased quality for legibility
        
        socket.emit("screen-data", {
          examId,
          studentId: user.id || user._id,
          studentName: user.name,
          studentRoll: user.rollNumber,
          frame: midResFrame,
          violationCount: violationCountRef.current,
          currentQuestion: current,
          totalQuestions: questions.length,
          answeredCount: Object.keys(answers).length,
          networkStatus: navigator.onLine ? "online" : "offline",
          deviceStatus: "active",
          lastViolation: violationLog.length > 0 ? violationLog[violationLog.length - 1].type : "none",
        });

        // 2. Database Record (Higher Res, every 10s for better "Recording" view)
        if (Date.now() - lastPeriodicShot > 10000) {
           lastPeriodicShot = Date.now();
           canvas.width = 640;
           canvas.height = 360;
           ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
           const midResFrame = canvas.toDataURL("image/jpeg", 0.8); // Higher quality

           apiClient.post("/api/violations", {
             examId, type: "periodic_snapshot", screenshot: midResFrame, severity: "low"
           }).catch(() => {});
        }
      }
    }, 3000); 

    return () => clearInterval(interval);
  }, [socket, submitted, examId, user, streamActive]);

  const handleSubmit = async (reason = "user_submit") => {

    if (!submissionId) return;
    try {
      setSubmitted(true);
      await apiClient.post(`/api/submissions/${submissionId}/submit`, { 
        answers, 
        terminationReason: reason 
      });
      localStorage.removeItem(`exam_backup_${examId}`);
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
    } catch (err) {
      toast.error("Save failed. We will try again.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Exam...</div>;
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 rounded-[32px] bg-rose-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Access Denied</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">{error}</p>
          <Button 
            className="w-full h-14 rounded-2xl font-black uppercase text-lg italic shadow-xl shadow-primary/20" 
            onClick={() => navigate(ROUTES.STUDENT_EXAMS)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }


  // ─── If finished ─────────────────────────────────────────────────────────
  if (submitted) {
    const answered = Object.keys(answers).length;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 rounded-[32px] bg-emerald-500/10 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Test Done!</h1>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-lg">
              <p className="text-2xl font-black italic text-primary">{answered}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Answered</p>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 shadow-lg">
              <p className="text-2xl font-black italic text-rose-500">{violations}</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1">Violations</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">Your answers have been submitted for review.</p>
          <Button className="w-full h-14 rounded-2xl font-black uppercase text-lg italic shadow-xl shadow-primary/20" onClick={() => navigate(ROUTES.STUDENT_RESULTS)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div
      className="min-h-screen bg-background flex flex-col select-none"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Warning Alert */}
      {warningMsg && (
        <div className="fixed top-0 inset-x-0 z-50 bg-rose-600 text-white text-sm text-center py-4 font-black uppercase tracking-widest animate-pulse shadow-2xl">
          {warningMsg}
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-card border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div>
          <p className="font-black text-xs uppercase tracking-widest opacity-50">Test ID: {examId}</p>
          <p className="text-sm font-black italic uppercase">Current Test</p>
        </div>
        <div className={`flex items-center gap-2 font-black italic text-2xl ${timeColor} tracking-tighter`}>
          <Clock className="w-6 h-6" />
          {formatCountdown(remaining)}
        </div>
        <div className="flex items-center gap-4">
          {violations > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-rose-500 font-extrabold uppercase tracking-tight">
              <AlertTriangle className="w-4 h-4" /> {violations} alert{violations !== 1 ? "s" : ""}
            </span>
          )}
          <Button variant="destructive" className="rounded-xl h-10 font-black uppercase text-xs px-6 shadow-lg shadow-rose-500/20" onClick={() => {
            if (window.confirm("Submit your test now?")) handleSubmit();
          }}>Submit Test</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question Panel */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                Question {current + 1} / {questions.length}
              </p>
              <button 
                onClick={() => setFlagged((p) => { const s = new Set(p); s.has(current) ? s.delete(current) : s.add(current); return s; })}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${flagged.has(current) ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "border-white/5 hover:bg-white/5 text-muted-foreground"}`}
              >
                <Flag className="w-4 h-4" /> {flagged.has(current) ? "Marked" : "Mark for later"}
              </button>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 shadow-xl mb-8">
              <p className="text-lg font-bold leading-relaxed tracking-tight">{q.questionText}</p>
            </div>

            <div className="space-y-4">
              {q.type === "coding" ? (
                <div className="h-[600px] border-2 border-white/5 rounded-[40px] overflow-hidden">
                  <OfflineCodeEditor 
                    initialValue={answers[current] || q.initialCode || ""}
                    language={q.language?.toLowerCase() || "javascript"}
                    onCodeChange={(val) => setAnswers(p => ({ ...p, [current]: val }))}
                  />
                </div>
              ) : q.type === "text" ? (
                <textarea
                  value={answers[current] || ""}
                  onChange={(e) => setAnswers(p => ({ ...p, [current]: e.target.value }))}
                  className="w-full h-[200px] bg-white/5 border-2 border-white/5 rounded-2xl p-6 text-sm focus:border-primary outline-none transition-all"
                  placeholder="Explain your answer here..."
                />
              ) : (
                <div className="space-y-4">
                  {["A", "B", "C", "D"].map((letter) => {
                    const opt = q.options?.[letter];
                    if (!opt) return null;
                    const selected = answers[current] === letter;
                    return (
                      <button key={letter} onClick={() => setAnswers((p) => ({ ...p, [current]: letter }))}
                        className={`w-full text-left flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-200 group
                          ${selected ? "border-primary bg-primary/5 shadow-inner" : "border-white/5 bg-white/5 hover:border-primary/40 hover:bg-white/10"}`}>
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors ${selected ? "bg-primary text-white" : "bg-white/10 text-muted-foreground group-hover:text-foreground"}`}>
                          {letter}
                        </span>
                        <span className="text-sm font-bold tracking-tight">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-10">
              <Button variant="outline" className="rounded-xl h-12 px-8 font-black uppercase text-xs" onClick={() => setCurrent((p) => Math.max(0, p - 1))} disabled={current === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              {current < questions.length - 1 ? (
                <Button className="rounded-xl h-12 px-10 font-black uppercase text-xs" onClick={() => setCurrent((p) => p + 1)}>
                  Next Question <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button variant="destructive" className="rounded-xl h-12 px-10 font-black uppercase text-xs" onClick={() => handleSubmit()}>Submit Test</Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Question List */}
        <div className="w-64 border-l border-white/5 bg-white/5 p-6 overflow-y-auto shrink-0 hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-5">Questions</p>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_, i) => {
              const answered = answers[i];
              const isFlagged = flagged.has(i);
              const isActive = current === i;
              return (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`h-10 w-full rounded-xl text-xs font-black transition-all transform hover:scale-105
                    ${isActive ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10" : ""}
                    ${isFlagged ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" : answered ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-muted-foreground/30"}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-8 space-y-3 text-[10px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Done ({Object.keys(answers).length})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500" /> Marked ({flagged.size})</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-muted-foreground/20" /> Empty</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client module: all Lab PC pages — fully live, socket-connected, DB-driven
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/core/constants/routes";
import { Button } from "@/components/ui/button";
import { Monitor, Lock, ShieldOff, Clock, BookOpen, AlertTriangle, Wifi, WifiOff, CheckCircle2 } from "lucide-react";
import { formatCountdown } from "@/core/utils/helpers";
import { useCountdown } from "@/core/hooks/useUtils";
import { apiClient } from "@/core/api/client";
import { io } from "socket.io-client";
import { toast } from "sonner";

// ─── Shared socket ref for kiosk — one connection for all screens ─────────────
let kioskSocket = null;

function getKioskSocket(token) {
  if (!kioskSocket || kioskSocket.disconnected) {
    kioskSocket = io(window.location.origin, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
    });
  }
  return kioskSocket;
}

// ─── Device Login ─────────────────────────────────────────────────────────────
export function DeviceLogin() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deviceInfo, setDeviceInfo] = useState(null);

  // Load device registration info from localStorage (set during Electron device approval)
  useEffect(() => {
    const stored = localStorage.getItem("device_info");
    if (stored) setDeviceInfo(JSON.parse(stored));
  }, []);

  const handleLogin = async () => {
    if (!studentId.trim() || !pin.trim()) {
      setError("Please enter your Roll Number and PIN.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Authenticate student against the DB
      const res = await apiClient.post("/api/auth/login", {
        email: studentId.includes("@") ? studentId : undefined,
        rollNumber: !studentId.includes("@") ? studentId : undefined,
        password: pin,
      });
      // Store token for socket auth
      localStorage.setItem("kiosk_token", res.token);
      localStorage.setItem("kiosk_user", JSON.stringify(res.user));
      // Connect kiosk socket with student token
      const sock = getKioskSocket(res.token);
      sock.emit("join-user-room", res.user.id);
      navigate(ROUTES.CLIENT_WAITING);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <Monitor className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">NEC EMS Exam Client</h1>
          <p className="text-gray-400 text-sm mt-1">Secure Examination Terminal</p>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="bg-gray-900 rounded-2xl w-full p-6 border border-gray-800 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Roll Number / Email</label>
            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="CS21001 or email"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Password / PIN</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              type="password"
              className="w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="••••••"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? "Verifying..." : "Login to Exam Terminal"}
          </button>
        </div>

        <p className="text-xs text-center text-gray-600 mt-4">
          {deviceInfo ? `PC: ${deviceInfo.hostname} · Lab: ${deviceInfo.lab}` : "Loading device info..."} · Support: ext. 100
        </p>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          NEC EMS © {new Date().getFullYear()} — Secure Examination Platform
        </p>
      </footer>
    </div>
  );
}

// ─── Waiting Screen ───────────────────────────────────────────────────────────
// Connects to socket, waits for "exam-start" command from proctor
export function WaitingScreen() {
  const navigate = useNavigate();
  const [examInfo, setExamInfo] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kiosk_user") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    const token = localStorage.getItem("kiosk_token");
    if (!token) { navigate(ROUTES.CLIENT_LOGIN); return; }

    // Fetch assigned exam info from DB
    apiClient.get("/api/exams/my-active", { headers: { Authorization: `Bearer ${token}` } })
      .then(data => setExamInfo(data))
      .catch(() => {}) // No active exam yet — waiting for proctor
      .finally(() => setLoading(false));

    const sock = getKioskSocket(token);

    sock.on("connect", () => setConnected(true));
    sock.on("disconnect", () => setConnected(false));

    // Proctor starts the exam → navigate to exam mode
    sock.on("receive-command", ({ command, payload }) => {
      if (command === "start_exam") {
        if (payload?.examId) localStorage.setItem("active_exam_id", payload.examId);
        navigate(ROUTES.CLIENT_EXAM);
      }
      if (command === "lock") navigate(ROUTES.CLIENT_LOCK);
    });

    return () => {
      sock.off("receive-command");
      sock.off("connect");
      sock.off("disconnect");
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white select-none">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-10 h-10 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Waiting for Exam to Start</h1>
          <p className="text-gray-400 mt-1 text-sm">The proctor will start your exam shortly. Please remain seated.</p>
        </div>

        {loading ? (
          <div className="bg-gray-900 w-full rounded-2xl p-5 border border-gray-800 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-3" />
            <div className="h-4 bg-gray-700 rounded mb-3 w-3/4" />
            <div className="h-4 bg-gray-700 rounded w-1/2" />
          </div>
        ) : (
          <div className="bg-gray-900 w-full rounded-2xl p-5 border border-gray-800 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Logged in as</span>
              <span className="font-semibold text-blue-400">{user.name || user.email || "Student"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Roll Number</span>
              <span>{user.rollNumber || "—"}</span>
            </div>
            {examInfo ? (
              <>
                <div className="border-t border-gray-800 pt-3 mt-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Assigned Exam</span>
                  <span className="font-semibold text-emerald-400">{examInfo.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration</span>
                  <span>{examInfo.duration} minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Questions</span>
                  <span>{examInfo.questionCount || examInfo.questions?.length || "—"}</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500 text-center pt-2">Awaiting exam assignment from proctor...</div>
            )}
          </div>
        )}

        <div className={`flex gap-2 text-xs items-center ${connected ? "text-emerald-400" : "text-red-400"}`}>
          {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {connected ? "Connected to exam server" : "Reconnecting..."}
        </div>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          NEC EMS © {new Date().getFullYear()} — Secure Examination Platform
        </p>
      </footer>
    </div>
  );
}

// ─── Exam Mode ────────────────────────────────────────────────────────────────
// Loads questions from DB, saves answers to DB on every change
export function ExamMode() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questions, setQuestions] = useState([]);
  const [examMeta, setExamMeta] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const autoSaveRef = useRef(null);
  const token = localStorage.getItem("kiosk_token");
  const user = (() => { try { return JSON.parse(localStorage.getItem("kiosk_user") || "{}"); } catch { return {}; } })();
  const examId = localStorage.getItem("active_exam_id");

  useEffect(() => {
    if (!token || !examId) { navigate(ROUTES.CLIENT_LOGIN); return; }
    apiClient.post(`/api/submissions/start`, { examId }, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setQuestions(res.questions || []);
        setExamMeta(res.exam || res);
        setSubmissionId(res.submissionId || res._id);
        // Restore any previously saved answers
        if (res.answers) setAnswers(res.answers);
      })
      .catch(err => toast.error("Failed to load exam: " + err.message))
      .finally(() => setLoading(false));
  }, [examId, navigate, token]);

  useEffect(() => {
    if (!submissionId) return;
    autoSaveRef.current = setInterval(() => {
      apiClient.put(`/api/submissions/${submissionId}/answers`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(() => {});
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [submissionId, answers, token]);

  // Socket: listen for lock / force_submit commands from proctor
  useEffect(() => {
    const sock = getKioskSocket(token);
    sock.on("receive-command", ({ command }) => {
      if (command === "lock") navigate(ROUTES.CLIENT_LOCK);
      if (command === "force_submit") handleSubmit(true);
    });
    return () => sock.off("receive-command");
  }, [navigate, answers, submissionId]);

  const handleAnswer = (qIndex, value) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
  };

  const handleSubmit = useCallback(async (forced = false) => {
    if (!forced && !window.confirm("Are you sure you want to submit your exam? This cannot be undone.")) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/api/submissions/${submissionId}/submit`,
        { answers, forcedByProctor: forced },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem("active_exam_id");
      navigate(ROUTES.CLIENT_WAITING);
      toast.success("Exam submitted successfully!");
    } catch (err) {
      toast.error("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }, [submissionId, answers, token, navigate]);

  const { remaining } = useCountdown(
    examMeta?.duration ? examMeta.duration * 60 : 3600,
    () => handleSubmit(true)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading your exam...</p>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-white select-none" style={{ userSelect: "none" }}>
      <header className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold text-sm">{examMeta?.title || "Examination"}</p>
          <p className="text-xs text-gray-400">
            Q {current + 1}/{questions.length} · {user.name} · {answered}/{questions.length} answered
          </p>
        </div>
        <div className={`font-mono font-bold text-xl ${remaining < 300 ? "text-red-400 animate-pulse" : "text-blue-400"}`}>
          {formatCountdown(remaining)}
        </div>
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          {submitting ? "Submitting..." : "Submit Exam"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 flex items-center justify-center p-6">
          {q ? (
            <div className="max-w-xl w-full space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Question {current + 1}</p>
                <p className="font-semibold text-lg leading-relaxed">{q.questionText || q.question || q.q}</p>
                {q.marks && <p className="text-xs text-blue-400 mt-2">{q.marks} mark{q.marks > 1 ? "s" : ""}</p>}
              </div>

              {(q.type === "mcq" || q.options?.length > 0) && (
                <div className="space-y-3">
                  {(q.options || q.opts || []).map((opt, i) => {
                    const letter = "ABCD"[i];
                    const sel = answers[current] === letter;
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(current, letter)}
                        className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          sel ? "border-blue-500 bg-blue-500/10" : "border-gray-800 bg-gray-900 hover:border-gray-700"
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${sel ? "bg-blue-500" : "bg-gray-800"}`}>
                          {letter}
                        </span>
                        {opt.text || opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {(q.type === "descriptive" || q.type === "essay") && (
                <textarea
                  value={answers[current] || ""}
                  onChange={e => handleAnswer(current, e.target.value)}
                  rows={8}
                  placeholder="Write your answer here..."
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              )}

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setCurrent(p => Math.max(0, p - 1))}
                  disabled={current === 0}
                  className="text-sm text-gray-400 hover:text-white disabled:opacity-30"
                >← Previous</button>
                <button
                  onClick={() => setCurrent(p => Math.min(questions.length - 1, p + 1))}
                  disabled={current === questions.length - 1}
                  className="bg-blue-600 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-30"
                >Next →</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No questions found. Please contact your proctor.</p>
          )}
        </div>

        {/* Question palette */}
        <div className="w-48 bg-gray-900 border-l border-gray-800 p-4 overflow-y-auto">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Questions</p>
          <div className="grid grid-cols-4 gap-1">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                  i === current ? "bg-blue-500 text-white" :
                  answers[i] ? "bg-emerald-600/30 text-emerald-400 border border-emerald-600/50" :
                  "bg-gray-800 text-gray-500 hover:bg-gray-700"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-600/50" /> Answered</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /> Current</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-gray-700" /> Not answered</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lock Screen ──────────────────────────────────────────────────────────────
// Listens for "unlock" command from proctor to resume
export function LockScreen() {
  const navigate = useNavigate();
  const [lockReason, setLockReason] = useState("This PC has been locked by the proctor.");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("kiosk_token");
    if (!token) return;
    const sock = getKioskSocket(token);

    sock.on("connect", () => setConnected(true));
    sock.on("disconnect", () => setConnected(false));

    sock.on("receive-command", ({ command, payload }) => {
      if (command === "unlock") navigate(ROUTES.CLIENT_EXAM);
      if (command === "lock" && payload?.reason) setLockReason(payload.reason);
      if (command === "terminate") navigate(ROUTES.CLIENT_VIOLATION);
    });

    return () => {
      sock.off("receive-command");
      sock.off("connect");
      sock.off("disconnect");
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white select-none" style={{ userSelect: "none" }}>
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center px-6">
        <div className="w-24 h-24 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mb-6 animate-pulse">
          <Lock className="w-12 h-12 text-yellow-400" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Screen Locked</h1>
        <p className="text-gray-400 text-sm max-w-xs mb-6">{lockReason}</p>
        <div className="bg-gray-900 rounded-xl p-4 border border-yellow-500/20 text-sm mb-6">
          <p className="text-yellow-400 font-semibold">Do not leave your seat.</p>
          <p className="text-gray-500 text-xs mt-1">The proctor will unlock your screen shortly.</p>
        </div>
        <div className={`flex gap-2 text-xs items-center ${connected ? "text-emerald-400" : "text-red-400"}`}>
          {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          {connected ? "Waiting for proctor signal..." : "Reconnecting..."}
        </div>
        <p className="mt-8 text-xs text-gray-600">Call Admin Support: ext. 100</p>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          NEC EMS © {new Date().getFullYear()} — Secure Examination Platform
        </p>
      </footer>
    </div>
  );
}

// ─── Violation Screen ─────────────────────────────────────────────────────────
// Shows live violation count from the DB submission record
export function ViolationScreen() {
  const navigate = useNavigate();
  const [violationData, setViolationData] = useState({
    count: 0,
    reason: "Multiple security violations were detected.",
    examTitle: "Your Exam"
  });

  useEffect(() => {
    const token = localStorage.getItem("kiosk_token");
    const examId = localStorage.getItem("active_exam_id");

    // Fetch actual violation count from DB
    if (token && examId) {
      apiClient.get(`/api/violations/my-count?examId=${examId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setViolationData(prev => ({
          ...prev,
          count: res.count || res.total || 0,
          examTitle: res.examTitle || prev.examTitle
        }));
      }).catch(() => {});
    }

    // Listen for further commands
    if (token) {
      const sock = getKioskSocket(token);
      sock.on("receive-command", ({ command }) => {
        // Proctor can allow resume even after violation screen
        if (command === "unlock" || command === "resume") navigate(ROUTES.CLIENT_EXAM);
      });
      return () => sock.off("receive-command");
    }
  }, [navigate]);

  const handleReturnToLogin = () => {
    // Clear session
    localStorage.removeItem("kiosk_token");
    localStorage.removeItem("kiosk_user");
    localStorage.removeItem("active_exam_id");
    if (kioskSocket) { kioskSocket.disconnect(); kioskSocket = null; }
    navigate(ROUTES.CLIENT_LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white select-none" style={{ userSelect: "none" }}>
      <div className="flex-1 flex flex-col items-center justify-center w-full text-center px-6">
        <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-6">
          <ShieldOff className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-red-400">Exam Terminated</h1>
        <p className="text-gray-400 text-sm max-w-sm mb-6">{violationData.reason}</p>

        <div className="bg-gray-900 rounded-2xl p-6 border border-red-500/30 text-sm w-full max-w-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Exam</span>
            <span className="font-semibold">{violationData.examTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Violations Recorded</span>
            <span className="text-red-400 font-bold">{violationData.count}</span>
          </div>
          <div className="border-t border-gray-800 pt-3">
            <p className="text-gray-500 text-xs">A detailed report has been sent to your proctor and HOD. Your submission has been auto-saved.</p>
          </div>
        </div>

        <button
          onClick={handleReturnToLogin}
          className="mt-8 text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
        >
          Return to Login
        </button>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          NEC EMS © {new Date().getFullYear()} — Secure Examination Platform
        </p>
      </footer>
    </div>
  );
}

export default DeviceLogin;

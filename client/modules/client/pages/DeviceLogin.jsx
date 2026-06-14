// Client module: all 5 Lab PC pages
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/core/constants/routes";
import { Button } from "@/components/ui/button";
import { Monitor, Lock, ShieldOff, Clock, BookOpen, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatCountdown } from "@/core/utils/helpers";
import { useCountdown } from "@/core/hooks/useUtils";

// ─── Device Login ─────────────────────────────────────────────────────────────
export function DeviceLogin() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">EduLearn Lab</h1>
          <p className="text-gray-400 text-sm mt-1">Exam Client v2.0</p>
        </div>

        <div className="bg-gray-900 rounded-2xl w-full p-6 border border-gray-800 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Student ID</label>
            <input value={studentId} onChange={(e) => setStudentId(e.target.value)}
              className="w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Your roll number" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} type="password"
              className="w-full mt-1.5 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="••••••" />
          </div>
          <button onClick={() => navigate(ROUTES.CLIENT_WAITING)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors">
            Login to Exam Client
          </button>
        </div>
        <p className="text-xs text-center text-gray-600 mt-4">PC: LAB-A-07 · Admin Support: ext. 100</p>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          developed by Prawinkumar N &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
}

// ─── Waiting Screen ───────────────────────────────────────────────────────────
export function WaitingScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-md w-full">
        <div className="w-20 h-20 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center mx-auto animate-pulse">
          <Clock className="w-10 h-10 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Waiting for Exam to Start</h1>
          <p className="text-gray-400 mt-1">The proctor will start the exam shortly.</p>
        </div>
        <div className="bg-gray-900 w-full rounded-2xl p-5 border border-gray-800 text-left space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-400">Exam</span><span className="font-semibold">Data Structures Mid-Term</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Duration</span><span>60 minutes</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Questions</span><span>40 MCQs</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-400">Logged in as</span><span className="font-semibold text-blue-400">Student CS21001</span></div>
        </div>
        <div className="flex gap-2 text-xs text-gray-500 items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
          Connected to exam server
        </div>
        <button onClick={() => navigate(ROUTES.CLIENT_EXAM)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors mt-4">
          Demo: Start Exam
        </button>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          developed by Prawinkumar N &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
}

// ─── Exam Mode ────────────────────────────────────────────────────────────────
export function ExamMode() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const { remaining } = useCountdown(3600, () => alert("Time up!"));

  const QUESTIONS = [
    { q: "What is O(log n)?", opts: ["Linear", "Logarithmic", "Quadratic", "Constant"] },
    { q: "Which is a stack operation?", opts: ["Enqueue", "Push", "Insert", "Append"] },
  ];

  const q = QUESTIONS[current % QUESTIONS.length];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col text-white select-none" style={{ userSelect: "none" }}>
      <header className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex items-center justify-between">
        <div>
          <p className="font-bold">Data Structures Mid-Term</p>
          <p className="text-xs text-gray-400">Question {current + 1}/40 · CS21001</p>
        </div>
        <div className="font-mono font-bold text-xl text-blue-400">{formatCountdown(remaining)}</div>
        <button onClick={() => { if (window.confirm("Submit exam?")) navigate(ROUTES.STUDENT_RESULTS); }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          Submit
        </button>
      </header>
      <div className="flex-1 flex items-center justify-center p-6 w-full">
        <div className="max-w-xl w-full space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="font-semibold text-lg">{q.q}</p>
          </div>
          {q.opts.map((opt, i) => {
            const letter = "ABCD"[i];
            const sel = answers[current] === letter;
            return (
              <button key={i} onClick={() => setAnswers((p) => ({ ...p, [current]: letter }))}
                className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${sel ? "border-blue-500 bg-blue-500/10" : "border-gray-800 bg-gray-900 hover:border-gray-700"}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${sel ? "bg-blue-500" : "bg-gray-800"}`}>{letter}</span>
                {opt}
              </button>
            );
          })}
          <div className="flex justify-between pt-2">
            <button onClick={() => setCurrent((p) => Math.max(0, p - 1))} className="text-sm text-gray-400 hover:text-white">← Previous</button>
            <button onClick={() => setCurrent((p) => p + 1)} className="bg-blue-600 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">Next →</button>
          </div>
        </div>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          developed by Prawinkumar N &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
}

// ─── Lock Screen ──────────────────────────────────────────────────────────────
export function LockScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-20 h-20 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Screen Locked</h1>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          This PC has been locked by the proctor. Please wait for assistance.
        </p>
        <p className="mt-6 text-xs text-gray-600">Call Admin: ext. 100</p>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          developed by Prawinkumar N &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
}

// ─── Violation Screen ─────────────────────────────────────────────────────────
export function ViolationScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mb-6">
          <ShieldOff className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2 text-red-400">Exam Terminated</h1>
        <p className="text-gray-400 text-sm text-center max-w-xs mb-2">
          Multiple security violations were detected. Your exam has been terminated and flagged for review.
        </p>
        <div className="bg-gray-900 rounded-xl p-4 border border-red-500/30 text-sm text-center mt-4 w-full max-w-sm">
          <p className="text-red-400 font-semibold">⚠️ 5 violations registered</p>
          <p className="text-gray-500 text-xs mt-1">A report has been sent to your proctor.</p>
        </div>
        <button onClick={() => navigate(ROUTES.CLIENT_LOGIN)}
          className="mt-8 text-xs text-gray-500 hover:text-gray-300 underline">
          Return to Login
        </button>
      </div>
      <footer className="w-full text-center py-6 mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500/50">
          developed by Prawinkumar N &copy; {new Date().getFullYear()} All rights received
        </p>
      </footer>
    </div>
  );
}

export default DeviceLogin;

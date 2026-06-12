import mongoose from "mongoose";
import crypto from "crypto";

/**
 * POST /api/exam/heartbeat
 * 
 * Called every 30s by the student client during an active exam.
 * If this endpoint is NOT called, a background janitor logs server-side violations.
 * This is the core of VULN-007 countermeasure.
 */
export const handleHeartbeat = async (req, res) => {
  try {
    const ExamHeartbeat = mongoose.model("ExamHeartbeat");
    const Submission = mongoose.model("Submission");
    const { examId, submissionId, answerSnapshot } = req.body;
    const studentId = req.user.id || req.user._id;

    if (!examId || !submissionId) {
      return res.status(400).json({ message: "examId and submissionId are required" });
    }

    // Verify ownership before accepting heartbeat
    const submission = await Submission.findById(submissionId);
    if (!submission || submission.student.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "Unauthorized heartbeat" });
    }

    if (submission.status !== "in_progress") {
      return res.status(400).json({ message: "Exam not in progress" });
    }

    // Hash the answer snapshot for integrity verification (not stored raw)
    const answerHash = answerSnapshot
      ? crypto.createHash("sha256").update(JSON.stringify(answerSnapshot)).digest("hex")
      : "";

    // Upsert heartbeat record
    await ExamHeartbeat.findOneAndUpdate(
      { student: studentId, exam: examId },
      {
        lastBeat: new Date(),
        submission: submissionId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "",
        answerHash,
        missedBeats: 0,
        isActive: true
      },
      { upsert: true, new: true }
    );

    res.json({ ok: true, serverTime: new Date().toISOString() });
  } catch (err) {
    console.error("[HEARTBEAT] Error:", err.message);
    res.status(500).json({ message: "Heartbeat failed" });
  }
};

/**
 * Background Janitor — runs every 45 seconds.
 * Any active heartbeat that hasn't been updated in >90s is flagged
 * as an inactivity/disconnect violation — server-side, client-independent.
 */
export const startHeartbeatJanitor = (io) => {
  const INACTIVITY_THRESHOLD_MS = 90 * 1000; // 90 seconds (3 missed 30s beats)

  setInterval(async () => {
    try {
      const ExamHeartbeat = mongoose.model("ExamHeartbeat");
      const Violation = mongoose.model("Violation");

      const cutoff = new Date(Date.now() - INACTIVITY_THRESHOLD_MS);
      const staleBeats = await ExamHeartbeat.find({
        isActive: true,
        lastBeat: { $lt: cutoff }
      }).populate("student", "name rollNumber").populate("exam", "title department");

      for (const beat of staleBeats) {
        beat.missedBeats += 1;
        beat.isActive = false; // Deactivate until next heartbeat received
        await beat.save();

        // Log server-side violation — cannot be suppressed by client
        const violation = await Violation.create({
          student: beat.student._id,
          exam: beat.exam._id,
          department: beat.exam?.department,
          type: "inactivity",
          message: `Server-detected inactivity: no heartbeat for ${Math.round(INACTIVITY_THRESHOLD_MS / 1000)}s`,
          severity: "high",
          timestamp: new Date()
        });

        console.warn(`[HEARTBEAT JANITOR] Inactivity violation logged for ${beat.student?.name} in exam ${beat.exam?.title}`);

        // Notify proctors in real-time
        if (io) {
          io.to("admin-dashboard").emit("new-violation", {
            ...violation.toObject(),
            studentName: beat.student?.name,
            studentRoll: beat.student?.rollNumber,
            source: "server-heartbeat-monitor"
          });
        }
      }

      if (staleBeats.length > 0) {
        console.log(`[HEARTBEAT JANITOR] Processed ${staleBeats.length} inactive sessions`);
      }
    } catch (err) {
      console.error("[HEARTBEAT JANITOR] Error:", err.message);
    }
  }, 45 * 1000);
};

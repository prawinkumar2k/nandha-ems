import User from "../models/User.js";
import Submission from "../models/Submission.js";
import RiskProfile from "../models/RiskProfile.js";
import mongoose from "mongoose";

/**
 * Risk profiles are calculated purely from exam integrity data:
 * - Exam failure rate
 * - Violation count
 * - Percentage scores
 * (Assignment engagement removed — out of exam platform scope)
 */
export const handleCalculateRiskProfiles = async (req, res) => {
  try {
    const students = await User.find({ role: "student", isActive: true });
    const updates = [];

    for (const student of students) {
      let riskScore = 0;
      const factors = [];

      // 1. Violation Deep Dive
      const violations = await mongoose.model("Violation").find({ student: student._id });
      let tabSwitches = 0;
      let devTools = 0;
      let fullscreenExits = 0;
      let copyPaste = 0;
      let multipleFaces = 0;

      violations.forEach(v => {
        if (v.type === "switched_tab" || v.type === "tab_switch") tabSwitches++;
        if (v.type === "devtools_open" || v.type === "tools_open") devTools++;
        if (v.type === "fullscreen_exit") fullscreenExits++;
        if (v.type === "copy_paste") copyPaste++;
        if (v.type === "multiple_faces" || v.type === "unauthorized_face") multipleFaces++;
      });

      if (tabSwitches > 0) {
        riskScore += tabSwitches * 10;
        factors.push(`Tab Switches (${tabSwitches})`);
      }
      if (devTools > 0) {
        riskScore += devTools * 25; // High penalty
        factors.push(`DevTools Accessed (${devTools})`);
      }
      if (fullscreenExits > 0) {
        riskScore += fullscreenExits * 5;
        factors.push(`Fullscreen Exits (${fullscreenExits})`);
      }
      if (copyPaste > 0) {
        riskScore += copyPaste * 15;
        factors.push(`Copy/Paste Attempts (${copyPaste})`);
      }
      if (multipleFaces > 0) {
        riskScore += multipleFaces * 20;
        factors.push(`Identity Warnings (${multipleFaces})`);
      }

      // 2. Exam Performance
      const submissions = await Submission.find({ student: student._id }).populate("exam", "passingMarks totalMarks");
      let failedExams = submissions.filter(sub => sub.exam && sub.percentage < (sub.exam.passingMarks || 40)).length;
      
      if (failedExams > 0) {
        riskScore += failedExams * 10;
        factors.push(`Failed ${failedExams} Exam(s)`);
      }

      // 3. Late or Auto-Submitted Exams
      const lateSubmissions = submissions.filter(s => s.lateSubmission || s.status === "auto_submitted").length;
      if (lateSubmissions > 0) {
        riskScore += lateSubmissions * 5;
        factors.push(`Auto-Submitted Exams (${lateSubmissions})`);
      }

      riskScore = Math.min(riskScore, 100);

      let riskLevel = "low";
      if (riskScore >= 75) riskLevel = "critical";
      else if (riskScore >= 50) riskLevel = "high";
      else if (riskScore >= 25) riskLevel = "medium";

      updates.push({
        updateOne: {
          filter: { student: student._id },
          update: {
            $set: {
              riskScore,
              riskLevel,
              primaryFactors: factors,
              lastCalculated: new Date()
            }
          },
          upsert: true
        }
      });
    }

    if (updates.length > 0) {
      await RiskProfile.bulkWrite(updates);
    }

    res.json({ message: "Risk profiles updated", studentsAnalyzed: students.length });
  } catch (err) {
    res.status(500).json({ message: "Failed to calculate risk profiles", error: err.message });
  }
};

export const handleGetRiskDashboard = async (req, res) => {
  try {
    const profiles = await RiskProfile.find()
      .populate({
        path: "student",
        select: "name email rollNumber department profilePic",
        populate: { path: "department", select: "name code" }
      })
      .sort({ riskScore: -1 })
      .limit(50);

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: "Failed to load risk dashboard", error: err.message });
  }
};

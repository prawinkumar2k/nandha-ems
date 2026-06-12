import mongoose from "mongoose";

const questionBankSchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["mcq", "text", "coding", "math", "file"], 
      default: "mcq" 
    },
    questionText: { type: String, required: true },
    
    // MCQ Options
    options: {
      A: String, B: String, C: String, D: String
    },
    
    correctAnswer: { type: String },

    // Coding Specifics
    language: { type: String },
    testCases: [
      {
        input: { type: String },
        output: { type: String }
      }
    ],

    // Text Answer Specifics
    answerType: { type: String, enum: ["short", "long"], default: "short" },

    // File Upload Specifics
    allowedExtensions: [{ type: String }],

    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    topic: { type: String, default: "" },
    
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    tags: [{ type: String }],
    usageCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.QuestionBank || mongoose.model("QuestionBank", questionBankSchema);

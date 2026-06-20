import mongoose from "mongoose";

const codeSnippetSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  input: {
    type: String,
    default: "",
  },
  output: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
  executedAt: {
    type: Date,
    default: Date.now,
  }
});

const CodeSnippet = mongoose.models.CodeSnippet || mongoose.model("CodeSnippet", codeSnippetSchema);
export default CodeSnippet;

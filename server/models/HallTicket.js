import mongoose from "mongoose";

const hallTicketSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lab: { type: mongoose.Schema.Types.ObjectId, ref: "Lab" },
    device: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
    seatNumber: { type: String },
    ticketNumber: { type: String, unique: true, required: true },
    issuedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

hallTicketSchema.index({ exam: 1, student: 1 }, { unique: true });
hallTicketSchema.index({ ticketNumber: 1 });

export default mongoose.models.HallTicket || mongoose.model("HallTicket", hallTicketSchema);

import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, default: "" },
    campusId: { type: mongoose.Schema.Types.ObjectId, ref: "Campus" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    credits: { type: Number, default: 3 },
    maxStudents: { type: Number, default: 60 },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    syllabus: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    academicYear: { type: String, required: true }, // e.g. "2024-2025"
  },
  { timestamps: true }
);

// Auto-enroll all students of the department into the course upon creation
courseSchema.post('save', async function(doc) {
  if (doc.department) {
    try {
      const User = mongoose.model('User');
      const students = await User.find({ department: doc.department, role: 'student' }).select('_id').lean();
      if (students.length > 0) {
        const studentIds = students.map(s => s._id);
        await mongoose.model('Course').updateOne(
          { _id: doc._id },
          { $addToSet: { enrolledStudents: { $each: studentIds } } }
        );
      }
    } catch (err) {
      console.error("Auto-enroll course error:", err);
    }
  }
});

export default mongoose.models.Course || mongoose.model("Course", courseSchema);

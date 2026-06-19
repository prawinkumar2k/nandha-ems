import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createServer, connectDB } from "../../../server/index.js";

let app;
let adminToken, hodToken, facultyToken, studentToken;
let hodId, facultyId, studentId, courseId, deptId, examId, submissionId;

beforeAll(async () => {
  await connectDB();
  app = createServer();
  // No-op
  
  // Create an Admin manually to bootstrap the tests
  const User = mongoose.model("User");
  let admin = await User.findOne({ email: "admin@nec.edu.in" });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: "admin@nec.edu.in",
      password: "password", // default hashed in pre-save if enabled
      role: "admin",
      isActive: true,
    });
  }

  // Since we might be bypassing the pre-save hook depending on the model setup, let's login directly or force the token.
  adminToken = jwt.sign(
    { id: admin._id, _id: admin._id, role: "admin", dept: admin.department },
    process.env.JWT_SECRET || "1234567890123456789012345678901234567890",
    { expiresIn: "1h" }
  );
});

afterAll(async () => {
  // await mongoose.disconnect();
});

describe("End-to-End System Simulation", () => {
  const uniqueId = Date.now();
  
  it("Chain 2a: Admin creates Department and Course", async () => {
    // Create Department
    const deptRes = await request(app)
      .post("/api/departments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: `Artificial Intelligence ${uniqueId}`, code: `AIDS-${uniqueId}` });
      
    if (deptRes.status !== 201) console.error("Dept Error:", deptRes.body);
    expect(deptRes.status).toBe(201);
    deptId = deptRes.body._id;

    // Create Course
    const courseRes = await request(app)
      .post("/api/courses")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: `Machine Learning ${uniqueId}`, code: `CS101-${uniqueId}`, credits: 3, department: deptId, semester: "5" });
      
    if (courseRes.status !== 201) console.error("Course Error:", courseRes.body);
    expect(courseRes.status).toBe(201);
    courseId = courseRes.body._id;
  });

  it("Chain 1: Admin creates and updates HOD User, then verifies Profile Sync", async () => {
    // Create HOD
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: `HOD AI&DS ${uniqueId}`,
        email: `hod${uniqueId}@nec.edu.in`,
        password: "password123",
        role: "hod",
        department: deptId,
        rollNumber: `hod-roll-${uniqueId}`,
        employeeId: `HOD-${uniqueId}`
      });
      
    if (res.status !== 201) console.error("HOD Create Error:", res.body);
    expect(res.status).toBe(201);
    hodId = res.body._id;

    // Admin Edits HOD
    const updateRes = await request(app)
      .put(`/api/users/${hodId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        phone: "9876543210",
        office: "AI Block Room 305",
        designation: "Head of Department",
        specialization: "Artificial Intelligence",
        employeeId: `HOD001-${uniqueId}`
      });
      
    if (updateRes.status !== 200) console.error("HOD Update Error:", updateRes.body);
    expect(updateRes.status).toBe(200);

    // Login as HOD to get token
    const User = mongoose.model("User");
    const hod = await User.findById(hodId);
    
    hodToken = jwt.sign(
      { id: hodId, _id: hodId, role: "hod", dept: deptId },
      process.env.JWT_SECRET || "1234567890123456789012345678901234567890",
      { expiresIn: "1h" }
    );

    // HOD fetches their own profile
    const profileRes = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${hodToken}`);
      
    if (profileRes.status !== 200) console.error("Profile Error:", profileRes.body);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.phone).toBe("9876543210");
    expect(profileRes.body.office).toBe("AI Block Room 305");
    expect(profileRes.body.designation).toBe("Head of Department");
    expect(profileRes.body.employeeId).toBe(`HOD001-${uniqueId}`);
  });

  it("Chain 2b: Admin creates Faculty & Student", async () => {
    // Create Faculty
    const facRes = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "AI Professor", email: `fac${uniqueId}@nec.edu.in`, password: "password123",
        role: "faculty", department: deptId, employeeId: `FAC001-${uniqueId}`, rollNumber: `fac-roll-${uniqueId}`
      });
    if (facRes.status !== 201) console.error("Faculty Error:", facRes.body);
    expect(facRes.status).toBe(201);
    facultyId = facRes.body._id;

    facultyToken = jwt.sign(
      { id: facultyId, _id: facultyId, role: "faculty", dept: deptId },
      process.env.JWT_SECRET || "1234567890123456789012345678901234567890",
      { expiresIn: "1h" }
    );

    // Create Student
    const stuRes = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Student 1", email: `stu1${uniqueId}@nec.edu.in`, password: "password123",
        role: "student", department: deptId, rollNumber: `21AI001-${uniqueId}`, employeeId: `stu-emp-${uniqueId}`
      });
    if (stuRes.status !== 201) console.error("Student Error:", stuRes.body);
    expect(stuRes.status).toBe(201);
    studentId = stuRes.body._id;

    studentToken = jwt.sign(
      { id: studentId, _id: studentId, role: "student", dept: deptId },
      process.env.JWT_SECRET || "1234567890123456789012345678901234567890",
      { expiresIn: "1h" }
    );
  });

  it("Chain 4a: Faculty creates an Exam with questions", async () => {
    // Create Exam
    const examRes = await request(app)
      .post("/api/hod/exams") // Using the hod endpoint which allows faculty and hod
      .set("Authorization", `Bearer ${facultyToken}`)
      .send({
        title: "Midterm AI",
        course: courseId,
        department: deptId,
        duration: 60,
        totalMarks: 10,
        scheduledAt: new Date().toISOString()
      });
      
    expect(examRes.status).toBe(201);
    examId = examRes.body._id;

    // Faculty creates a Question in Bank
    const qRes = await request(app)
      .post("/api/questions")
      .set("Authorization", `Bearer ${facultyToken}`)
      .send({
        course: courseId,
        department: deptId,
        type: "mcq",
        difficulty: "medium",
        questionText: "What is AI?",
        options: ["Apple", "Artificial Intelligence", "Ant", "None"],
        correctAnswer: "Artificial Intelligence",
        marks: 10
      });
    expect(qRes.status).toBe(201);
    
    // Add question to exam (mocking update)
    const Exam = mongoose.model("Exam");
    await Exam.findByIdAndUpdate(examId, { $push: { questions: qRes.body._id }, status: "active" });
  });

  it("Chain 4b: Student Takes Exam, Submits Answer, and Triggers Violation", async () => {
    // 1. Device check simulation (assuming bypass or mock)
    const startRes = await request(app)
      .post(`/api/submissions/start`)
      .set("Authorization", `Bearer ${studentToken}`)
      // Simulate bypass device check using test environment or manual mock
      .set("x-device-id", "device-mock") 
      .send({ examId });
      
    if (startRes.status !== 201) console.error("Start Exam Error:", startRes.body);
    expect(startRes.status).toBe(201);
    submissionId = startRes.body._id;

    // 2. Submit Answer
    const ansRes = await request(app)
      .put(`/api/submissions/${submissionId}/answers`)
      .set("Authorization", `Bearer ${studentToken}`)
      .set("x-device-id", "device-mock")
      .send({ answers: { 0: "Artificial Intelligence" } });
    if (ansRes.status !== 200) console.error("Update Answer Error:", ansRes.body);
    expect(ansRes.status).toBe(200);

    // 3. Trigger Violation
    const vioRes = await request(app)
      .post(`/api/violations`)
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        examId,
        type: "tab_switch",
        severity: "medium",
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        metadata: { url: "google.com" }
      });
    if (vioRes.status !== 201) console.error("Violation Error:", vioRes.body);
    expect(vioRes.status).toBe(201);

    // 4. Final Submit
    const subRes = await request(app)
      .post(`/api/submissions/${submissionId}/submit`)
      .set("Authorization", `Bearer ${studentToken}`)
      .set("x-device-id", "device-mock");
    if (subRes.status !== 200) console.error("Final Submit Error:", subRes.body);
    expect(subRes.status).toBe(200);
  });

  it("Chain 4c: HOD views the reports and violation telemetry", async () => {
    // HOD fetches Exam Stats
    const statsRes = await request(app)
      .get("/api/hod/stats")
      .set("Authorization", `Bearer ${hodToken}`);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body.studentCount).toBe(1); // 1 student created
    expect(statsRes.body.recentViolations).toBeGreaterThan(0); // Violation was logged

    // Admin views Global Violations
    const globalVio = await request(app)
      .get("/api/logs/violations")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(globalVio.status).toBe(200);
    expect(globalVio.body.data.length).toBe(1);
    expect(globalVio.body.data[0].type).toBe("tab_switch");
  });

});

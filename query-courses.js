import mongoose from "mongoose";
import "dotenv/config";
import "./server/models/Course.js";
import "./server/models/User.js";

async function query() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Course = mongoose.model("Course");
    const courses = await Course.find({}).lean();
    console.log(JSON.stringify(courses, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
query();

import mongoose from "mongoose";
import "dotenv/config";
import "./server/models/Course.js";
import "./server/models/User.js";

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const courses = await mongoose.model("Course").find().lean();
    console.log("Total courses:", courses.length);
    console.log(JSON.stringify(courses, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}
check();

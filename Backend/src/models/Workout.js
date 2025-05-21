import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number }, // 可选字段
});

const WorkoutSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    notes: { type: String }, // 可选
    image: { type: String }, // base64 encoded or URL
    exercises: [ExerciseSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

const Workout = mongoose.model("Workout", WorkoutSchema);
export default Workout;

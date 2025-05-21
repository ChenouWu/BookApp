import express from "express";
import Workout from "../models/Workout.js";
import cloudinary from "../libs/cloudinary.js";
import protectRoutes from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/post", protectRoutes, async (req, res) => {
      try {
        const { title, duration, notes, image, exercises } = req.body;

    if (!title || !duration || !exercises || exercises.length === 0) {
      return res.status(400).json({ message: "Title, duration, and at least one exercise are required." });
    }
    let imageUrl = "";
    
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "workouts",
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newWorkout = new Workout({
      title,
      duration,
      notes,
      image: imageUrl,
      exercises,
      user: req.user._id,
    });

    await newWorkout.save();
    res.status(201).json({ message: "Workout plan created successfully." });

  } catch (error) {
    console.error("Workout creation error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/get", protectRoutes, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id })
      .populate("user", "username profileImage")
      .populate("likes", "username profileImage")
      .populate("comments.user", "username profileImage");

    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: error.message });
  }
});


  
export default router;
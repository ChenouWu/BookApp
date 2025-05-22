import express from "express";
import Workout from "../models/Workout.js";
import cloudinary from "../libs/cloudinary.js";
import protectRoutes from "../middleware/auth.middleware.js";
const router = express.Router();

//post a workout
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
//get my workouts
router.get("/getmy", protectRoutes, async (req, res) => {
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

// for home page; get newest 8 workouts
router.get("/geteight", protectRoutes, async (req, res) => {
    try {
    const workouts = await Workout.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("user", "username profileImage");

    res.status(200).json(workouts);
  } catch (error) {
    console.error("Error fetching home workouts:", error);
    res.status(500).json({ message: error.message });
  }
});

//get specific workout
router.get("/:id", async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate("user", "username profileImage")
      .populate("comments.user", "username profileImage");
    

    if (!workout) return res.status(404).json({ message: "Workout not found" });

    res.status(200).json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



  
export default router;
import express from "express";
import Workout from "../models/Workout.js";
import cloudinary from "../libs/cloudinary.js";
import protectRoutes from "../middleware/auth.middleware.js";
const router = express.Router();

//post a workout
router.post("/post", protectRoutes, async (req, res) => {
  try {
    const { title, duration, notes, images, exercises } = req.body;

    if (!title || !duration || !exercises || exercises.length === 0) {
      return res
        .status(400)
        .json({ message: "Title, duration, and at least one exercise are required." });
    }

    const imageUrls = [];

    if (images && Array.isArray(images) && images.length > 0) {
      for (const base64 of images) {
        const uploadRes = await cloudinary.uploader.upload(base64, {
          folder: "workouts",
        });
        imageUrls.push(uploadRes.secure_url);
      }
    }

    const newWorkout = new Workout({
      title,
      duration,
      notes,
      images: imageUrls,
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

// DELETE /api/workout/delete/:id
router.delete("/delete/:id", protectRoutes, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this workout" });
    }

    await workout.deleteOne(); //
    res.status(200).json({ message: "Workout deleted successfully." });

  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ message: error.message });
  }
});
// PUT /api/workout/update/:id
router.put("/update/:id", protectRoutes, async (req, res) => {
  try {
    const { title, duration, notes, images, exercises } = req.body;

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    // 检查是否为本人创建的 workout
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this workout" });
    }


    const imageUrls = [];

    if (Array.isArray(images) && images.length > 0) {
      for (const base64 of images) {
        if (base64.startsWith("data:image")) {
          const uploadRes = await cloudinary.uploader.upload(base64, { folder: "workouts" });
          imageUrls.push(uploadRes.secure_url);
        } else {
          
          imageUrls.push(base64);
        }
      }
      workout.images = imageUrls; 
    }
    
    if (title !== undefined) workout.title = title;
    if (duration !== undefined) workout.duration = duration;
    if (notes !== undefined) workout.notes = notes;
    if (exercises !== undefined) workout.exercises = exercises;

    await workout.save();

    res.status(200).json({ message: "Workout updated successfully.", workout });
  } catch (error) {
    console.error("Error updating workout:", error);
    res.status(500).json({ message: error.message });
  }
});



  
export default router;

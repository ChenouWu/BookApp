import express from 'express';
import Book from '../models/worksout.js';
import cloudinary from '../libs/cloudinary.js';
import protectRoutes from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoutes,async (req, res) => {
    try{   
    const { title, caption, image, rating } = req.body;
    if(!image) return res.status(400).json({ message: "Image is required" });
    if(!image || !title || !caption || !rating) return res.status(400).json({ message: "All fields are required" });
    // upload image to cloudinary
    //save book to database
    const uploadResponse =  await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    const newBook = new Book({
        title,
        caption,
        image: imageUrl,
        rating,
        user: req.user._id
        })
        await newBook.save();
        res.status(201).json({ message: "Book created successfully" });
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.get("/",protectRoutes,async (req,res) => {
    try{
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.send({
            books,
            currentPage: page,
            totalBooks:Math.ceil(totalBooks / limit)
        });

    }catch(error){
        res.status(500).json({ message: error.message });
    }
}) 

router.delete("/:id", protectRoutes, async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        if(!book) return res.status(404).json({ message: "Book not found" });

        //check if user is the owner of the book
        if(book.user.toString() !== req.user._id.toString()) 
            return res.status(401).json({ message: "Unauthorized" });

        //delete image from cloudinary
        if(book.image && book.image.includes("cloudinary")){
            try{
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }catch(error){
                console.log(error);
            }
        }

        await book.deleteOne();
    }catch(error){
        res.status(500).json({ message: error.message })
    }
}
)

//get recommended books by the logged in user
router.get("/recommended", protectRoutes, async (req, res) => {
    try{
        const books = await Book.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        res.json(books);
    }catch(error){
        res.status(500).json({ message: error.message });
    }
})  

export default router;
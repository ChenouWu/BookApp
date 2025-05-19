import mongoose from "mongoose";

const BooksSchema = new mongoose.Schema({
    title: { type: String, required: true },
    caption: { type: String, required: true },
    image: { type: String, required: true },
    rating:{ type: Number, required: true,min: 0, max: 5 },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Books = mongoose.model("Books", BooksSchema);
export default Books;

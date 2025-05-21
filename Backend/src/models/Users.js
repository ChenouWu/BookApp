import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  profileImage: { type: String, default: "" },
  location: { type: String, default: "" },   // optional
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Workout" }], // if needed
  // role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });



// Hash password before saving to database
userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
})
// Compare password
userSchema.methods.comparePassword = async function(userpassword){
    return await bcrypt.compare(userpassword,this.password);
}

const Users = mongoose.model("User",userSchema);


export default Users;



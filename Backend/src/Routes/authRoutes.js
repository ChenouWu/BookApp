import express from 'express';
import Users from '../models/Users.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId)=>{
    return jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'15d'})
}
// @desc Register a new user
router.post('/register', async (req, res) => {
    try{

        const {email,username,password} = req.body;

        if(!username|| !email || !password){
           return res.status(400).json({message:"All fields are required"})
        }
        if(password.length< 6 ){
           return res.status(400).json({message:"Password should at least 6 characters long"});
        }

        const exsitUser = await Users.findOne({email});

        if(exsitUser) return res.status(400).json({message:"User already exist"});

        //get random avatar
        const profileImage =  `https://api.dicebear.com/9.x/big-ears/svg?seed=￥{username}`;

        const newUser = new Users({
            email,
            username,
            password,
            profileImage
        })
        await newUser.save();
        const token = generateToken(newUser._id);
        res.status(201).json({
            user:{
                 _id:newUser._id,
            email:newUser.email,
            username:newUser.username,
            profileImage:newUser.profileImage,
            },
            token
        })

    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
});

// @desc Login user
 router.post("/login",  async(req, res) => {
    // Login user
    try{
        const {email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        //check if user exists
        const user = await Users.findOne({email});
        if(!user) return res.status(400).json({message:"User not found"});
        //check if password is correct
        const isPasswordCorrect = await user.comparePassword(password);
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid credentials"});
        //generate token
        const token = generateToken(user._id);
        res.status(200).json({
            user:{
                _id:user._id,
                email:user.email,
                username:user.username,
                profileImage:user.profileImage,
            },
            token
        })
    }catch(error){
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}
);

export default router;

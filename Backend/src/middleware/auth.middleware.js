import jwt from 'jsonwebtoken';
import Users from './../models/Users.js';

const protectRoutes = async (req, res, next) => {   
    try{
        const token = req.headers.authorization.replace("Bearer ","");
        if(!token) return res.status(401).json({ message: "No token Provided" });

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Users.findById(decoded.userId).select("-password");
         if(!user) return res.status(401).json({ message: "Unauthorized" });

        req.user = user;
        next();
    }catch(error){
        console.log(error);
        res.status(500).json({ message: "Internal server error" });

    }
}
export default protectRoutes;
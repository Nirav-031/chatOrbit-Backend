const jwt = require('jsonwebtoken');

const generateTocken = (payload) => {
    return  jwt.sign(payload, process.env.SECRET);
}

const verifyTocken =async (req,res,next) => {
    //  return  jwt.verify(payload, process.env.SECRET);
    try {
        // console.log(req.cookies);
        console.log("token",req.cookies.token);
        if (!req.cookies.token) {
            return res.status(400).json("Token invalid");
        }
        const token = req.cookies.token;
            
        
             req.user=await jwt.verify(token, process.env.SECRET);
        next();
            // const result=await User.find({})
            // console.log(req.user);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { generateTocken,verifyTocken };
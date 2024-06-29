const User = require('../model/userSchema');
const { validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const multer = require('multer');
const {generateTocken,verifyTocken} =require('../jwt')
const cloudinary = require('cloudinary').v2
const fs = require('fs');
const Message = require('../model/messageSchema');
const Request = require('../model/request');
const { default: mongoose } = require('mongoose');
const { getConnectedUserID, io } = require('../socket/socket');

// cloudinary.config({
//   cloud_name: process.env.CLOUD_API_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret:process.env.CLOUD_API_SECRET
// });

cloudinary.config({ 
  cloud_name: 'dnfa5frye', 
  api_key: '266817528558464', 
  api_secret: 'cvvinXHpcdP930rXX43Zwvn1G3U' 
});
exports.registrationController = async (req, res) => {
    try {
        const { name, email, password, photo, bio } = req.body;
        console.log(name, email, password, photo, bio);
        console.log("file",req.file);
        
        const error = validationResult(req);
        if (!error.isEmpty()) {
           return res.status(400).json({ message: 'Validation errors', errors: error.array() });
            
        }

        //if the Email already present in the DB
        const existingUser = await User.findOne({ email });
        if (existingUser)
        {
            if(req.file) fs.unlinkSync(req.file.path)
            return res.status(400).json("User Already Present")            
        }
        

        //password Hashing
        const hashPassword = await bcrypt.hash(password, 10);
        let photoUrl = '';
        //new User Registration
        let newUser;
        if (req.file)
        {
            const result=  await cloudinary.uploader.upload(req.file.path,
            { public_id: req.file.originalname }, 
            );
            photoUrl = result.secure_url;
             newUser = await User.insertMany({
                        name,
                        email,
                        password: hashPassword,
                        photo1: {
                            
                            public_id: req.file.originalname && req.file.originalname ,
                            url: photoUrl ? photoUrl : defaultProfile
                        },
                        bio: bio ? bio : "hey there !! i Am using Chat Orbit"
                    })
        }
        else
        {
            
            let defaultProfile = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?w=740&t=st=1716816011~exp=1716816611~hmac=97c2056285e1ca6f97fbc0d1f3e70fdd60edc1034f2f5b3dd6a33a2fdb6048b5";

              newUser = await User.insertMany({
                        name,
                        email,
                        password: hashPassword,
                        photo1: {
                            
                            
                            url:  defaultProfile
                        },
                        bio: bio ? bio : "hey there !! i Am using Chat Orbit"
                    })
            }
        
        
        if (newUser)
        {
            if(req.file) fs.unlinkSync(req.file.path)
            return res.status(200).json(newUser);    
        }
        else
        {
            if(req.file) fs.unlinkSync(req.file.path)
            return res.status(400).json("something went wrong");
        }
    } catch (error) {
        if(req.file) fs.unlinkSync(req.file.path)
        console.log(error);
    }


}



exports.loginController = async (req, res) => {
    try {
         const error = validationResult(req);
        if (!error.isEmpty()) {
            res.status(400).json(error)
            
        }
        const { email, password } = req.body;
        const result = await User.findOne({ email });
        if (result)
        {
            const pass =await bcrypt.compare( password,result.password);
            // console.log(pass);
            if (pass)
            {
                const token = generateTocken({ id: result._id, email })
                // console.log(token);
                res.cookie("token", token,
                     {
          httpOnly: true,
          secure: true,
          sameSite: "None"
        }
                )
                return res.status(200).json({ res:{id:result._id,name:result.name,email:result.email,photo1:result.photo1,bio:result.bio} });    
            } else
            {
                res.status(400).json("Password not match");
                
                }
        }
        else
        {
            res.status(400).json("please register first");
            
        }
        } catch (error) {
        console.log(error);
            res.status(400).json(error);
        
    }
}

exports.logoutController = (req, res, next) => {
    try {
        res.cookie("token", "", {
           
            expires: new Date(0)
        });
        console.log("logout");
       return res.status(200).json({ msg: "logout successfully" });
    } catch (error) {
        console.log(error);
        next(error);
    }
}


exports.fetchAllUsers = async (req, res) => {
    try {
        console.log("user id",req.user.id);

        //to check whethere userId not present in the request collection
        const requestData = await Request.find({ sender: req.user.id, });
        const requestDataReceiver = await Request.find({ receiver: req.user.id  });
        
        console.log("request data",requestDataReceiver);
        //filter userID's
        const requestID = requestData.map((user) => user.receiver)
       const requestID2= requestDataReceiver.map((user)=>user.sender)
        
       console.log("request id",requestID,requestID2);
        const data = await User.find({ _id: { $nin: [req.user.id,...requestID,...requestID2] } }).select('-password');
        
        // console.log("dtatatat",data);
        
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
    }

}


exports.getNotification =async (req, res, next) => {
    try {
        const { senderID } = req.body;
        console.log(senderID);
        const data = await Request.find({ receiver: req.user.id,status:"pending" }).populate("sender","-password")
        
        data? res.status(200).json(data):res.status(400).json({msg:"something went wrong"})

    } catch (error) {
        next(error);
    }
}

exports.sendNotification =async (req, res, next) => {
    try {
        const { senderID, receiverID } = req.body;
        if (!senderID) throw new Error("senderID required");
        if (!receiverID) throw new Error("receiverID required");
            
        const result = await Request.insertMany({ sender: senderID, receiver: receiverID });

        const receiverSocketID = getConnectedUserID(receiverID);
        if (receiverSocketID)
        {
            io.to(receiverSocketID).emit("newNotification",true);
            }
        result? res.status(200).json({msg:"request Sent successfully"}):res.status(400).json({msg:"something went wrong"})
        
    } catch (error) {
        next(error);
    }
}


exports.acceptRequest =async (req, res, next) => {
    try {
        const { senderID,receiverID } = req.body;
        
        if (!senderID) throw new Error("senderID required");
        if (!receiverID) throw new Error("receiverID required");
          

        // Convert senderID and receiverID to ObjectId if they are not already
        const senderObjectId =new mongoose.Types.ObjectId(senderID);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverID);

        const data = await Request.findOneAndUpdate(
            { sender: senderObjectId, receiver: receiverObjectId },
            { status: "accepted" },
            { new: true }
        );

        // const data = await Request.findByIdAndUpdate({ sender: senderID, receiver: receiverID }, { status: "accepted" }, { new: true });

       
        data ? res.status(200).json({ msg: "request Accepted" }) : res.status(400).json({ msg: "request not Accepted" });
    } catch (error) {
        console.log(error);
        next(error)
    }
}


exports.declineRequest =async (req, res, next) => {
    try {
        const { senderID,receiverID } = req.body;
        console.log("sender",senderID);
        if (!senderID) throw new Error("senderID required");
        if (!receiverID) throw new Error("receiverID required");
          

        // Convert senderID and receiverID to ObjectId if they are not already
        const senderObjectId =new mongoose.Types.ObjectId(senderID);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverID);

        const data = await Request.findOneAndDelete(
            { sender: senderObjectId, receiver: receiverObjectId,status:"pending" },
           
            { new: true }
        );

        data ? res.status(200).json({ msg: "request Deleted successFully" }) : res.status(400).json({ msg: "request not Deleted successFully" });

    } catch (error) {
        console.log(error);
        next(error);
    }
}




exports.updateProfile =async (req, res, next) => {
    try {
        const { name, bio } = req.body;
        console.log("file", req.file);
        const user = await User.findById({ _id: req.user.id });
        console.log(user.photo1);
        
        let result;
            if (req.file)
            {
                const imageID = user.photo1.public_id;
                if (imageID) {
                    await cloudinary.uploader.destroy(imageID);
                }

                const newImage= await cloudinary.uploader.upload(req.file.path,
                    { public_id: req.file.originalname }, 
                    );
                photoUrl = newImage.secure_url;
                
                 result = await User.findByIdAndUpdate(
                    { _id: req.user.id },
                    {
                        name, bio,
                        photo1: {
                            public_id: req.file.originalname,
                            url:photoUrl
                        }
                     }, { new: true }
                );
            } else
            {
                
                 result = await User.findByIdAndUpdate(
                    { _id: req.user.id },
                    { name, bio }, { new: true }
                );
            }
        if (result)
        {
             if(req.file) fs.unlinkSync(req.file.path)
            res.status(200).json({ msg: "Profile Updated SuccessFully",data:result });
        } else
        {
             if(req.file) fs.unlinkSync(req.file.path)
            res.status(400).json({ msg: "Something went Wrong" });
            
            }
        console.log(req.user);
    } catch (error) {
         if(req.file) fs.unlinkSync(req.file.path)
        next(error);
    }
}
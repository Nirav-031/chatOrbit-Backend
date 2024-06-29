const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require: true
        },
        password: {
            type: String,
            require: true
        },
        photo1: {
            public_id: {
                type: String,
               
            },
            url: {
               
            type: String,
            require: true,
            default: "https://www.freepik.com/free-vector/blue-circle-with-white-user_145857007.htm#fromView=search&page=1&position=2&uuid=6fae3dfd-9dd8-4db8-b1c6-602d713d002f"
            
            }
       
        },
        
        bio: {
            type: String,
            require: true,
            default: "Hey there ! i am using a ChatOrbit "
            
        }
    }
    ,
    { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports=User
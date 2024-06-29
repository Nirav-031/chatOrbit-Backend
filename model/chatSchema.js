const mongoose = require('mongoose');

const chatModel = new mongoose.Schema({
    // chatName: {
    //     type: String
    // },
    // isGroup: {
    //     type: Boolean,
    //     default:false
    // },
    users: [
        
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    // groupAdmin: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User"
    // }
    messages:
    [
            {
        
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;
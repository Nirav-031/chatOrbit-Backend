    const mongoose = require('mongoose');

    const messageSchema = new mongoose.Schema({
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
       receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        message: {
            type: String
        }
    }, { timestamps: true });

    const Message = mongoose.model("Message", messageSchema);

    module.exports = Message;
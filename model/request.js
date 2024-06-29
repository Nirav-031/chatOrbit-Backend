const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require:true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require:true
    },
    status: {
        type:String,
        default: "pending",
        enum:["pending","accepted"]
    }
}, { timestamps: true })

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
const { default: mongoose } = require("mongoose");
const Chat = require("../model/chatSchema");
const Message = require("../model/messageSchema");
const Request = require("../model/request");
const User = require("../model/userSchema");
const { io, getConnectedUserID } = require("../socket/socket");

exports.fetchAllUsers = async (req, res, next) => {
    
    try {
        

        const data = await Request.find({ sender: req.user.id, status: "accepted" });
        const data1 = await Request.find({ receiver: req.user.id ,status:"accepted"});
        
        const requestID = data.map((user) => user.receiver)
        const requestID2= data1.map((user)=>user.sender)
        const result = await User.find({ _id: { $in: [...requestID, ...requestID2] } }, { password: 0 });


        result ? res.status(200).json(result) : res.status(400).json("please make friends first");
        // console.log(result);
    } catch (error) {
        console.log(error);
        next(error);
    }
}


exports.sendMessage =async (req, res, next) => {
    try {
        
        const senderID = req.user.id;
        const receiverID = req.params.receiverID;

        const { message } = req.body;
// console.log(receiverID);
        let getConversation = await Chat.findOne({users:{$all:[senderID,receiverID]} });

        if (!getConversation)
        {
            getConversation = await Chat.create({users:[receiverID,senderID] });    
        }
        
        const newMessage = await Message.insertMany({
            sender: senderID,
            receiver: receiverID,
            message
        });

        console.log(newMessage[0]._id);
        if (newMessage) {
            getConversation.messages.push(newMessage[0]._id);
        }

        //socket io
        await getConversation.save();
        const receiverSocketID = getConnectedUserID(receiverID);
        if (receiverSocketID)
        {
            io.to(receiverSocketID).emit("newMessage",newMessage);
            }
        res.status(200).json(newMessage);
    } catch (error) {
        next(error);
    }
}


exports.getMessages=async (req, res, next)=> {
    try {
        const receiverID = req.params.receiverID;
        const senderID = req.user.id;
        if (!senderID) {
            res.status(400).json({msg:"senderID required"})
        }
        if (!receiverID) {
            res.status(400).json({msg:"receiverID required"})
        }
        
        const data = await Chat.find({ users: { $all: [senderID, receiverID] } }).populate("messages");
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        next(error);
    }
}



exports.unFriend=async (req, res, next)=> {
    try {
        const receiverID = req.params.receiverID;
        const senderID = req.user.id;
        if (!senderID) {
            res.status(400).json({ msg: "senderID required" })
        }
        if (!receiverID) {
            res.status(400).json({ msg: "receiverID required" })
        }
        const senderObjectId =new mongoose.Types.ObjectId(senderID);
        const receiverObjectId = new mongoose.Types.ObjectId(receiverID);

         const data = await Request.findOneAndDelete({
        $or: [
            { sender: senderObjectId, receiver: receiverObjectId },
            { sender: receiverObjectId, receiver: senderObjectId }
        ]
         });
        
       
         const receiverSocketID = getConnectedUserID(receiverID);
        if (receiverSocketID)
        {
            io.to(receiverSocketID).emit("setHome",true);
            }
        data?res.status(200).json({msg:"UnFriend Succesfully"}):res.status(400).json({msg:"Something went wrong"});
    } catch (error) {
        console.log(error);
        next(error);
    }
}

















// exports.createNewGroup =async (req, res) => {
//     try {
//         const {groupName,members } = req.body;
//         console.log(groupName, members);
        
//         if (members.length < 2) return res.status(400).json({ msg: "select at least 2 members" })
        
//         const allMembers = [...members, req.user.id];
        
//         const newGroupChat = await Chat.insertMany({
//             chatName: groupName,
//             isGroup: true,
//             users: allMembers,
//             groupAdmin:req.user.id
//         })
        
//         if(newGroupChat) res.status(200).json({status:"success",msg:"Group Chat Created"})
        
//         emmitEvent(req, ALERT, allMembers, `new ${groupName} group created`);
//         emmitEvent(req, REFRESH_CHAT, allMembers, `new ${groupName} group created`);

//     } catch (error) {
//         console.log(error);
//     }
//     // return res.send(req.user);
// }

// exports.createNewChat =async (req, res) => {
//     try {
//         const {chatName,members } = req.body;
//         console.log(chatName, members[0]);
        
//         //if (members.length < 2) return res.status(400).json({ msg: "select at least 2 members" })
//         const memberName = await User.find({ _id: members })
//         // console.log(memberName);
//         const allMembers = [...members, req.user.id];
        
//         const newChat = await Chat.insertMany({
//             chatName: memberName[0].name,
            
//             users: allMembers,
//             groupAdmin:req.user.id
//         })
        
//         if(newChat) res.status(200).json({status:"success",msg:"new Chat Created"})
        
//         // emmitEvent(req, ALERT, allMembers, `new ${groupName} Chat created`);
//         // emmitEvent(req, REFRESH_CHAT, allMembers, `new ${groupName} group created`);

//     } catch (error) {
//         console.log(error);
//     }
//     // return res.send(req.user);
// }



// //get all sidebar chats
// exports.getAllSingleSideChats =async (req, res) => {
//     try {
//         const chats = await Chat.find({ users: req.user.id,isGroup:false })
//             .populate('users', "name photo1").populate('groupAdmin', "name");
            
        
        
//          const transformedChats = chats.map(chat => {
//             const filteredUsers = chat.users.filter(user => user._id.toString() !== req.user.id.toString());
//             return {
//                 _id: chat._id,
//                 chatName: chat.chatName,
//                 isGroup: chat.isGroup,
//                 users: filteredUsers,
//                 groupAdmin: chat.groupAdmin,
//                 createdAt: chat.createdAt,
//                 updatedAt: chat.updatedAt
//             };
//         });

//         // Send the transformed chat data as response
//         res.status(200).json(transformedChats);
          
//     } catch (error) {
//         console.log(error);
//     }
// }



// //get All groups

// exports.getAllGroups =async (req,res) => {
//    try {
//        const groups = await Chat.find({ isGroup: true, users: req.user.id }).populate('users',"name photo1").populate('groupAdmin',"name")
//        console.log(groups);


//        const data = groups.map((group) => {
//            const filterGroupUser = group.users.filter((user) => user._id.toString() !== req.user.id.toString())
//            return {
//                _id: group.id,
//                groupName: group.chatName,
//                groupAdmin: group.groupAdmin,
//                members:filterGroupUser
//            }
//        })
//         res.status(200).json(data);

//    } catch (error) {
//     console.log(error);
//    }
// }


// //add member to the groups
// exports.addMembersToGroup = async (req, res, next) => {
//     try {
//         const { chatId, members } = req.body;
//         if (!chatId) throw new Error("Chat ID not found");
//         if (!members || members.length < 1) throw new Error("Members not found");

//         // Find chat by chat ID
//         const chat = await Chat.findById(chatId);
//         if (!chat) throw new Error("Chat not found");

//         // Find all members' usernames
//         const allMembersPromises = members.map(memberId => User.findById(memberId, "name"));
//         const allMemberPromises = await Promise.all(allMembersPromises);
//         console.log(allMemberPromises);

//         // Filter out members who are already in the chat
//         const uniqueMembers = allMemberPromises
//             .filter(member => !chat.users.includes(member._id.toString()))
//             .map(member => member._id);

//         // Add unique members to the users array
//         chat.users.push(...uniqueMembers);
//         await chat.save();

//         // Get usernames of new members
//         const allUserNames = allMemberPromises.map(member => member.name);

//         // Emit events
//         emmitEvent(req, ALERT, chat.users, `${allUserNames.join(", ")} added to the group`);
//         emmitEvent(req, REFRESH_CHAT, chat.users);

//         res.status(200).json(chat);
//     } catch (error) {
//         next(error);
//     }
// };


// exports.removeFromGroup = async (req, res, next) => {
//     try {
//         const { chatId, userID } = req.body;

//         if (!chatId) throw new Error("Chat ID not found");
//         if (!userID || userID.length < 1) throw new Error("Members not found");
        
//         //find chat and user using id's
//         const [chat, removedUser] = await Promise.all([
//             Chat.findById({ _id: chatId }),
//             User.findById({ _id: userID },"name")
//         ]);

//         chat.users = chat.users.filter((user) => user._id.toString() !== userID.toString());
//         chat.save();

//         emmitEvent(req, ALERT, chat.users, `${removedUser.name} remved from the group`);
//         emmitEvent(req, REFRESH_CHAT, chat.users);

//         res.status(200).json(chat);

//     } catch (error) {
//         next(error);
//     }
// }
const express = require('express');
const app = express.Router();
const chatController = require('../controller/chat');
const { verifyTocken } = require('../jwt');


app.get('/friends',verifyTocken, chatController.fetchAllUsers);
app.post('/sendMessages/:receiverID', verifyTocken, chatController.sendMessage);
app.get('/getMessages/:receiverID', verifyTocken, chatController.getMessages);
app.delete('/unFriend/:receiverID',verifyTocken,chatController.unFriend)



// app.post('/create-group',verifyTocken, chatController.createNewGroup);

// app.post('/create-chat',verifyTocken, chatController.createNewChat);

// //get all sidebar chats
// app.get('/getAllSingle', verifyTocken, chatController.getAllSingleSideChats)


// //fetch all groups
// app.get('/getAllGroup', verifyTocken, chatController.getAllGroups)

// //add members to group
// app.put('/addMember', verifyTocken, chatController.addMembersToGroup);

// //remove members to group
// app.put('/removeMember', verifyTocken, chatController.removeFromGroup);

module.exports = app;
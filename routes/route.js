const express = require("express");
const route = express.Router();
const controller = require('../controller/controll');
const { body } = require('express-validator');
const multer = require("multer");
const { verifyTocken } = require("../jwt");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   return cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    
     return cb(null, `${Date.now()}-${file.originalname}`);
  }
})

const upload = multer({ storage })

route.post('/registration', upload.single("photo"),
    body('name').notEmpty().withMessage("name Must be Require"),
    body('email').isEmail().notEmpty().withMessage("email Must be Require"),
    body('password').isLength({ min: 4 }).withMessage("Password should be at least 4 char long").notEmpty().withMessage("Password must be require")
,controller.registrationController);


route.post('/login', body('email').isEmail().notEmpty().withMessage("email Must be Require"),
    body('password').isLength({ min: 4 }).withMessage("Password should be at least 4 char long").notEmpty().withMessage("Password must be require")
   ,controller.loginController)

route.post('/logout', controller.logoutController);

//routes to make Friends
route.get('/fetchAll',verifyTocken,controller.fetchAllUsers)
route.get('/getNotification', verifyTocken, controller.getNotification)
route.post('/sendNotification', verifyTocken, controller.sendNotification);
route.put('/acceptRequest', verifyTocken, controller.acceptRequest);
route.put('/declineRequest', verifyTocken, controller.declineRequest);
route.post('/profile',upload.single("photo"),verifyTocken,controller.updateProfile)


module.exports = route;
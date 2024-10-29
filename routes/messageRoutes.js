const express = require('express');
const router = express.Router();
const User = require('../models/userModel')
const Message = require('../models/messageModel')
const Conversation = require('../models/conversationModel')
const Group = require('../models/groupModel')
const GroupMessage = require('../models/groupMessageModel')

const authenticate = require('../middleware/authenticate')

const upload = require('../middleware/multer')
const dataUri = require('../middleware/dataUri')
const cloudinary = require('../middleware/cloudinary')


router.post('/sender/:id',authenticate,upload.single('pic'),async function(req,res){
    try{
        
        const checkSender =await User.findById(req.userId)
        if(!checkSender){
            return res.status(400).json('sender not exists')
        }
        const checkReceiver =await User.findById(req.params.id)
        if(!checkReceiver){
            return res.status(400).json('receiver not exists')
        }
        if(req.userId === req.params.id){
            return res.status(400).json('sender and receiver cannot be same')
        }
        const dataUriParser = dataUri(req.file) 
        const response = await cloudinary.uploader.upload(dataUriParser, {
            folder: "chat"
        });
        const message = await Message.create({
            senderId: req.userId,
            receiverId: req.params.id,
            message: req.body.mode === 'text' ? req.body.message : null,
            imageUrl: req.body.mode === 'image' ? response.secure_url : null,
            mode: req.body.mode
        })

        let  conversation = await Conversation.findOne({
            members: {$all: [req.userId,req.params.id]}
        })
        if(!conversation){
            conversation = await Conversation.create({
                members: [req.userId,req.params.id]
            })
        }
        conversation.messages.push(message._id)
        await conversation.save();
        res.status(200).json(message)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})


router.get('/get/:id',authenticate,async function(req,res){
    try{
        const checkSender =await User.findById(req.userId)
        if(!checkSender){
            return res.status(400).json('sender not exists')
        }
        const checkReceiver =await User.findById(req.params.id)
        if(!checkReceiver){
            return res.status(400).json('receiver not exists')
        }
        if(req.userId === req.params.id){
            return res.status(400).json('sender and receiver cannot be same')
        }
        const conversation =await Conversation.findOne({
            members: {$all: [req.userId,req.params.id]}
        }).populate({
            path: 'messages',
            populate: {
                path: 'receiverId'
            }
        })
        if(!conversation){
            return res.status(200).json([])
        }
        res.status(200).json(conversation.messages)

    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

//createGroup
router.post('/createGroup',authenticate,async function(req,res){
    try{
        
        const currentUser =await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('current user not exists')
        }
   
        const createGroup = await Group.create({
            name: req.body.name
        })

        if(!createGroup.members.includes(req.userId)){
            createGroup.members.push(req.userId)
        }
        await createGroup.save()
        res.status(200).json(createGroup)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

//getGroup
router.get('/getGroup',authenticate,async function(req,res){
    try{
        
        const currentUser =await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('current user not exists')
        }
   
        const createGroup = await Group.find().populate({
            path: 'members',
            select: 'name profileImage username'
        })
        res.status(200).json(createGroup)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

//singleGroup
router.get('/singleGroup/:id',authenticate,async function(req,res){
    try{
        
        const currentUser =await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('current user not exists')
        }
   
        const singleGroup = await Group.findById(req.params.id)
        .populate('members') // Populate members first
        .populate({
            path: 'messages',
            populate: { path: 'senderId' } // Populate userInfo inside messages
        });        
        res.status(200).json(singleGroup)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

//deleteGroup
router.delete('/deleteGroup/:id',authenticate,async function(req,res){
    try{
        
        const currentUser =await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('current user not exists')
        }
        const findGroup = await Group.findById(req.params.id)
        if (!findGroup) {
            return res.status(404).send('Group not found');
        }
        const deleteGroup = await Group.findByIdAndDelete(req.params.id)
        res.status(200).json(deleteGroup)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

//addMembers
router.get('/addMembers/:groupId/:id',authenticate,async function(req,res){
    try{
        
        const currentUser =await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('current user not exists')
        }
        if(req.userId === req.params.id){
            return res.status(400).json('admin and member cannot be same')
        }
        const findGroup =await Group.findById(req.params.groupId)
        if(!findGroup){
            return res.status(400).json('Group not exists')
        }
        if(findGroup.members.includes(req.params.id)){
            return res.status(400).json('Member already exists')
        }
        findGroup.members.push(req.params.id)
        await findGroup.save()

        const populateGroup = await Group.findById(req.params.groupId).populate('members')

        res.status(200).json(populateGroup.members)
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

router.post('/sendMessage/:groupId',authenticate,async function(req,res){
    try{
        
        const currentUser =await User.findById(req.userId)
        if(!currentUser){
            return res.status(400).json('current user not exists')
        }
        const findGroup =await Group.findById(req.params.groupId)
        if(!findGroup){
            return res.status(400).json('Group not exists')
        }
        const message = await GroupMessage.create({
            senderId: req.userId,
            message: req.body.message,
            // imageUrl: req.body.mode === 'image' ? req.file.path : null,
        })
        findGroup.messages.push(message._id)
        await findGroup.save()
         // Populate the newly created message with senderId
         const populatedMessage = await GroupMessage.findById(message._id).populate('senderId');

         // Optionally, you can also return the entire group with messages populated
         const updatedGroup = await Group.findById(req.params.groupId).populate({
             path: 'messages',
             populate: { path: 'senderId' } // Populate senderId for all messages if needed
         });
 
         // Return the populated message object
         res.status(200).json({ latestMessage: populatedMessage, allMessages: updatedGroup.messages });
    }
    catch(error){
        return res.status(400).json(error.message)
    }
})

module.exports = router
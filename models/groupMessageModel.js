const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message:{
        type: String
    },
    // imageUrl:{
    //     type: String
    // },

},{timestamps: true})


const groupMessage = mongoose.model('groupMessage', groupMessageSchema);
module.exports = groupMessage
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'groupMessage'
        }]
    }
);

const Group = mongoose.model('Group', GroupSchema);
module.exports = Group
const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
        },
        password: {
            type: String,
            required: [true, 'Please enter a password'],
        },
        isStaff: {
            type: Boolean,
            required: true,
            default: false,
        },
        isManager: {
            type: Boolean,
            required: true,
            default: false,
        },
        assignedTickets: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);

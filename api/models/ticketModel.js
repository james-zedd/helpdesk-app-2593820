const mongoose = require('mongoose');

const ticketSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        product: {
            type: String,
            required: [true, 'Please select a product'],
            enum: ['iPhone', 'Samsung', 'ASUS', 'MSI', 'Custom PC'],
        },
        description: {
            type: String,
            required: [true, 'Please add a description of the issue'],
        },
        status: {
            type: String,
            required: true,
            enum: ['new', 'open', 'closed'],
            default: 'new',
        },
        isAssigned: {
            type: Boolean,
            default: false,
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Ticket', ticketSchema);

const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');

// @desc   get user tickets
// @route  GET /api/tickets
// @auth?  true
const getTickets = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    const tickets = await Ticket.find({ user: req.user.id });

    res.status(200).json(tickets);
});

// @desc   get user ticket
// @route  GET /api/tickets/:id
// @auth?  true
const getTicket = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('ticket not found');
    }

    if (ticket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('not authorized');
    }

    res.status(200).json(ticket);
});

// @desc   create new ticket
// @route  POST /api/tickets
// @auth?  true
const createTicket = asyncHandler(async (req, res) => {
    const { product, description } = req.body;

    if (!product || !description) {
        res.status(400);
        throw new Error('please add a product and a description');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    const ticket = await Ticket.create({
        product: product,
        description: description,
        user: req.user.id,
        status: 'new',
    });

    res.status(201).json(ticket);
});

// @desc   delete user ticket
// @route  DELETE /api/tickets/:id
// @auth?  true
const deleteTicket = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('ticket not found');
    }

    if (ticket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('not authorized');
    }

    await ticket.remove();

    res.status(200).json({ success: true, message: 'ticket deleted' });
});

// @desc   update user ticket
// @route  PUT /api/tickets/:id
// @auth?  true
const updateTicket = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        res.status(404);
        throw new Error('ticket not found');
    }

    if (ticket.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('not authorized');
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedTicket);
});

module.exports = {
    getTickets,
    getTicket,
    deleteTicket,
    updateTicket,
    createTicket,
};

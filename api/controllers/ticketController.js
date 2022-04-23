const asyncHandler = require('express-async-handler');

const User = require('../models/userModel');
const Ticket = require('../models/ticketModel');

// @desc   get user tickets
// @route  GET /api/tickets
// @auth?  true
const getTickets = asyncHandler(async (req, res) => {
    // get user by id in JWT. also check if is staff
    let user;
    let tickets;

    if (req.user.isManager) {
        user = await User.findById(req.user.id);
        tickets = await Ticket.find();
    } else if (req.user.isStaff) {
        user = await User.findById(req.user.id).populate('assignedTickets');
        tickets = user.assignedTickets;
    } else {
        user = await User.findById(req.user.id);
        tickets = await Ticket.find({ user: req.user.id });
    }

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

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

    const ticket = await Ticket.findById(req.params.id).populate('assignedTo', [
        'name',
        'email',
    ]);

    if (!ticket) {
        res.status(404);
        throw new Error('ticket not found');
    }

    if (ticket.user.toString() == req.user.id || req.user.isStaff) {
        res.status(200).json(ticket);
    } else {
        res.status(401);
        throw new Error('not authorized');
    }
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

// @desc   get staff assigned tickets
// @route  GET /api/tickets/staff
// @auth?  true
const getStaffTickets = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    if (!user.isStaff) {
        res.status(403);
        throw new Error('Must be staff member to access assigned tickets');
    }

    if (user.assignedTickets == undefined) {
        res.status(500);
        throw new Error(
            'Server error: user does not have assignedTickets array'
        );
    }

    if (user.assignedTickets.length > 0) {
        const tickets = await Ticket.find({ user: req.user.id });

        res.status(200).json(tickets);
    } else {
        res.status(200).json({
            message: 'No tickets are assigned to you at this time.',
        });
    }
});

// @desc   get all tickets (manager)
// @route  GET /api/tickets/manager
// @auth?  true
const getAllTickets = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    if (!user.isManager) {
        res.status(403);
        throw new Error('Must be a manager to use this feature.');
    }

    const tickets = await Ticket.find();

    res.status(200).json(tickets);
});

// @desc   assign ticket to staff member (manager)
// @route  POST /api/tickets/manager/assign
// @auth?  true
const assignTicketToStaff = asyncHandler(async (req, res) => {
    // get user by id in JWT
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(401);
        throw new Error('user not found');
    }

    if (!user.isManager) {
        res.status(403);
        throw new Error('Must be a manager to use this feature.');
    }

    const { staffId, ticketId } = req.body;

    if (!staffId || !ticketId) {
        res.status(401);
        throw new Error('Missing parameters');
    }

    const staff = await User.findById(staffId);

    if (!staff) {
        res.status(401);
        throw new Error('user not found');
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        res.status(401);
        throw new Error('ticket not found');
    }

    if (ticket.isAssigned) {
        res.status(400);
        throw new Error('ticket is already assigned');
    }

    staff.assignedTickets.push(ticket._id);
    await staff.save();

    ticket.isAssigned = true;
    ticket.assignedTo = staff._id;
    ticket.status = 'open';
    await ticket.save();

    const staffTickets = await Ticket.findById(ticketId).populate('assignedTo');

    res.status(200).json({
        status: 200,
        staff: staff,
        ticketId: ticket,
        populate: staffTickets.assignedTickets,
    });
});

module.exports = {
    getTickets,
    getTicket,
    deleteTicket,
    updateTicket,
    createTicket,
    getStaffTickets,
    getAllTickets,
    assignTicketToStaff,
};

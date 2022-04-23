const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// @desc   Register a new user
// @route  POST /api/users
// @auth?  false
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('User data not accepted. Please include all fields.');
        return;
    }

    // find if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create User
    const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }

    res.send('Register route');
});

// @desc   login a user
// @route  POST /api/users/login
// @auth?  false
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // check for user and if password is match
    if (user && (await bcrypt.compare(password, user.password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id, user.isStaff, user.isManager),
            isStaff: user.isStaff,
            isManager: user.isManager,
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials.');
    }
});

// @desc   get current user
// @route  GET /api/users/me
// @auth?  true
const getme = asyncHandler(async (req, res) => {
    const user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isStaff: req.user.isStaff,
        isManager: req.user.isManager,
        assignedTickets: req.user.assignedTickets,
    };
    res.status(200).json({
        status: 200,
        data: user,
    });
});

// @desc   get staff users
// @route  GET /api/users/staff
// @auth?  true
const getStaffUsers = asyncHandler(async (req, res) => {
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

    const name = new RegExp(req.query.name, 'i');

    const staffUsers = await User.find({
        name: { $regex: name },
        isStaff: true,
    });

    res.status(200).json({
        status: 200,
        data: staffUsers,
    });
});

// generate token
const generateToken = (id, isStaff, isManager) => {
    return jwt.sign({ id, isStaff, isManager }, process.env.JWT_SECRET, {
        expiresIn: '20m',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getme,
    getStaffUsers,
};

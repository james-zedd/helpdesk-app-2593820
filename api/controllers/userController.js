const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

// @desc   Register a new user
// @route  /api/users
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
// @route  /api/users/login
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
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials.');
    }
});

// @desc   get current user
// @route  /api/users/me
// @auth?  true
const getme = asyncHandler(async (req, res) => {
    const user = {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
    };
    res.status(200).json({
        status: 200,
        data: user,
    });
});

// generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '20m',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getme,
};

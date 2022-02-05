const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const User = require('../models/user');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');








/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


router.get('/' , ensureLoggedIn, async (req , res , next) => {
    try{ 
        const allUsers = await User.all();
        return res.json(allUsers)
    }catch(e) {
        return next(e);
    }
})


router.get('/:username' , ensureLoggedIn, async (req , res , next) => {
    try{
        const {username} = req.params
        const user = await User.get(username);
        return res.json(user);
    }catch(e) {
        return next(e);
    }
})

router.get('/:username/to' , ensureCorrectUser , async function (req , res , next) {
    try{
        let messages = await User.messagesTo(req.params.username);
        return res.json({messages})
    }catch (e) {
        return next(e);
    }
})

router.get('/:username/from' , ensureCorrectUser , async(req , res, next) => {
    try{
        const messages = await User.messagesFrom(req.params.username);
        return res.json({messages});
    }catch(e) {
        return next(e)
    }
})



module.exports = router;
const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const User = require('../models/user');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
const Message = require('../models/message')
const currentDate = new Date();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/


router.get('/:id' , ensureLoggedIn , async (req , res , next) => {
    try{
        const id = req.params;
        const message = await Message.get(id);
        return res.json(message);
    }catch (e) {
        return next(e);
    }
})

router.post('/' , ensureLoggedIn , async (req , res, next) => {
    try{
        const {from_username , to_username , body} = req.body;
        const message = await Message.create({from_username , to_username , body});
        return res.json(message);
    }catch (e) {
        return next(e);
    }
})

router.post('/:id/read' , ensureCorrectUser ,async (req , res , next) => {
    try{
        const id = req.params.id;
        const message = await Message.markRead(id);
        return res.json(message);
    }catch(e) {
        return next(e);
    }
})


module.exports = router;
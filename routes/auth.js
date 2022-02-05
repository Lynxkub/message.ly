const express = require('express');
const router = new express.Router();
const ExpressError = require('../expressError');
const db = require('../db');
const User = require('../models/user');
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');






/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register' ,  async (req , res , next) => {
    try{
        const {username , password , first_name , last_name , phone} = req.body;
        if(!username || !password || !first_name || !last_name || !phone) {
            throw new ExpressError('Username , password , first name , last name , and phone number required' , 400);
        }
        let user = await User.register(username , password , first_name , last_name , phone);
        let token = jwt.sign(user , SECRET_KEY);
        const newLogIn = await User.updateLoginTimestamp(username);
        return res.json({token});
    }catch(e) {
        return next(e);
    }
})


router.post('/login' , async (req , res, next) => {
    try{
        const{username , password} = req.body;
        if(!username || !password) {
            throw new ExpressError('Username and password required' , 400);
        }else{
            const user = await User.authenticate(username , password)
            
            if(user) {
                const token = jwt.sign({username : `${username}`} , SECRET_KEY)
                const newLogIn = await User.updateLoginTimestamp(username);
                return res.json({message: 'Logged In' , token})
            }
        }
    }catch(e) {
        return next(e);
    }
})




module.exports = router;
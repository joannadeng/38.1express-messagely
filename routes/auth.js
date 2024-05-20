const express = require("express");
const router = new express.Router();
const ExpressError = require('../expressError');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user")

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/


router.post('/login', async(req, res, next) => {
    try{
        const {username, password} = req.body;
        if (!username || !password) {
            throw new ExpressError ("Username and password require", 400);
        }
        if (await User.authenticate(username, password) === true) {
            await User.updateLoginTimestamp(username);
            const token = jwt.sign({username}, SECRET_KEY)
            return res.json({token});
        }
        throw new ExpressError("Invalid username/password", 400);
    }catch(e){
        return next(e);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post('/register', async (req, res, next) => {
    try{
        const {username ,password, first_name, last_name, phone} = req.body;
        await User.register({username, password, first_name, last_name, phone});
        await User.updateLoginTimestamp(username);
        const token = jwt.sign({username}, SECRET_KEY);
        return res.json({token})
        
    }catch(e){
        return next(e)
    }
})

module.exports = router;

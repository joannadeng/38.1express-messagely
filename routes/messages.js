const express = require("express");
const router = new express.Router();
const {ensureLoggedIn, ensureCorrectUser} = require('../middleware/auth')
const Message = require('../models/message');
const ExpressError = require("../expressError");
const db = require("../db")

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

router.get('/:id', ensureLoggedIn, async (req,res,next) => {
    const result = await db.query(`SELECT * FROM messages WHERE id=$1`,[req.params.id]);
   
    if ((req.user.username === result.rows[0].from_username) || (req.user.username === result.rows[0].to_username) ) {
        const message = await Message.get(req.params.id)
        return res.json({message})
    }
    return next(new ExpressError('Unauthorized', 404))
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', ensureLoggedIn, async (req,res,next) => {
    const {to_username, body} = req.body;
    const message = await Message.create(
        {
            "from_username":req.user.username,
            "to_username": to_username,
            "body": body
        })
    return res.json({message})
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', ensureLoggedIn, async (req, res, next) => {
    const result = await db.query(`SELECT * FROM messages WHERE id=$1`,[req.params.id]);
    const recipient = result.rows[0].to_username;
    if(req.user.username === recipient){
        const message = await Message.markRead(req.params.id);
        return res.json({message});
    }
    return next(new ExpressError('Unauthorized', 404))
})

module.exports = router; 


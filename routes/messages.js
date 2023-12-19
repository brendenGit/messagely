const express = require("express");
const Message = require("../models/message")
const ExpressError = require("../middleware/expressError");
const jwt = require("jsonwebtoken");
const router = new express.Router();
const { SECRET_KEY } = require('../config');

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
router.get("/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const validMsg = await Message.get(id);
        if (validMsg) return res.json({ message: validMsg })
        throw new ExpressError('Cannot find message.', 404);
    } catch (err) {
        return next(err);
    };
});



/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async (req, res, next) => {
    try {
        const { from_username, to_username, body } = req.body;
        const message = Message.create({ from_username, to_username, body })
        if (message) return res.json(message);
        throw new ExpressError('Error posting message', 400);
    } catch (err) {
        return next(err);
    };
});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", async (req, res, next) => {
    try {
        const msgId = req.params.id;
        const markedRead = Message.markRead(msgId);
        return res.json(markedRead);
    } catch (err) {
        return next(err);
    };
});


module.exports = router;
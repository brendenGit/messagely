const router = new express.Router();
const User = require("../models/user")
const ExpressError = require("../middleware/expressError");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const usersList = await User.all();
        return res.json({ usersList });
    } catch (err) {
        return next(err);
    };
});


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        const username = req.params.username;
        const validUser = await User.get(username);

        if (validUser) {
            return res.json({ validUser });
        } else {
            throw new ExpressError(`No user found with username: ${username}`, 404);
        };

    } catch (err) {
        return next(err);
    };
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
    try {
        const username = req.params.username;
        const validResopnse = await User.messagesTo(username);

        if (validResopnse) {
            return res.json({ validResopnse });
        } else {
            throw new ExpressError(`Error finding user messages to: ${username}`, 404);
        };

    } catch (err) {
        return next(err);
    };
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
    try {
        const username = req.params.username;
        const validResopnse = await User.messagesFrom(username);

        if (validResopnse) {
            return res.json({ validResopnse });
        } else {
            throw new ExpressError(`Error finding user messages from: ${username}`, 404);
        };

    } catch (err) {
        return next(err);
    };
});



module.exports = router;
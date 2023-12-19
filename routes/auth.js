const jwt = require("jsonwebtoken");
const router = new express.Router();

const User = require("../models/user");
const { SECRET_KEY } = require('../config');
const ExpressError = require("../middleware/expressError");


/** POST /login - logs user in */
router.post("/login", async (req, res, next) => {
    try {
        const { username, password} = req.body;
        const valid = await User.authenticate(username, password);
        if(valid) {
            User.updateLoginTimestamp(username);
            const token = jwt.sign({ username }, SECRET_KEY)
            return res.json({ token });
        } else {
            throw new ExpressError('Invalid username/password!', 400);
        }
    } catch (err) {
        return next(err);
    };
});


/** POST /register - register user: registers, logs in, and returns token. */
router.post("/register", async (req, res, next) => {
    try {
        const { username, password, first_name, last_name, phone } = req.body;
        const validSignUp = await User.register({ username, password, first_name, last_name, phone })

        if(validSignUp) {
            User.updateLoginTimestamp(username);
            const token = jwt.sign({ username }, SECRET_KEY)
            return res.json({ token });
        } else {
            throw new ExpressError('Invalid values for registartion!', 400);
        }

    } catch (err) {
        return next(err);
    };
});

module.exports = router;
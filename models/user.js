/** User class for message.ly */
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config')


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    try {
      const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
      const currentDate = new Date();
      const result = db.query(
        `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $6)
        RETURNING username`, [username, hashedPw, first_name, last_name, phone, currentDate]
      );
      return result.json(result.rows[0]);
    } catch (err) {
      return next(err);
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    try {
      const result = await db.query(
        `SELECT password FROM users WHERE username = $1`,
        [username]
      );
      const user = result.rows[0];

      if (user) {
        if (await bcrypt.compare(password, user.password) === true) {
          const timeStamp = updateLoginTimestamp(username);
          return res.json({ message: "Logged in!", timestamp: timeStamp });
        }
      }
      throw new ExpressError("Invalid user/password", 400);
    } catch (err) {
      return next(err);
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    try {
      const currentDate = new Date();
      const result = await db.query(
        `UPDATE users SET last_login_at = $1 WHERE username = $2 RETURNING last_login_at`,
        [currentDate, username]
      );
      return res.json(result.rows[0]);
    } catch (err) {
      return next(err)
    }
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {
    try {
      const result = await db.query(
        `SELECT username, first_name, last_name, phone
        FROM users`
      );
      return res.json(result.rows);
    } catch (err) {
      return next(err);
    }
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    try {
      const result = db.query(
        `SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`,
        [username]
      );
      const user = result.rows[0];
      if (user) return res.json(user);
      throw new ExpressError(`User with username ${username}, not found`, 404);
    } catch (err) {
      return next(err);
    }
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    try {
      const result = db.query(
        `SELECT id, to_username, body, sent_at, read_at
        FROM messages
        WHERE from_username = $1`,
        [username]
      );
      const messages = result.rows;
      return res.json(messages);
    } catch (err) {
      return next(err);
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    try {
      const result = db.query(
        `SELECT id, from_user, body, sent_at, read_at
        FROM messages
        WHERE to_username = $1`,
        [username]
      );
      const messages = result.rows;
      return res.json(messages);
    } catch (err) {
      return next(err);
    }
  }
}


module.exports = User;
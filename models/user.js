/** User class for message.ly */
const bcrypt = require('bcrypt');
const db = require("../db");
const ExpressError = require("../middleware/expressError");
const { BCRYPT_WORK_FACTOR } = require('../config')


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPw = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING username, password`,
      [username, hashedPw, first_name, last_name, phone]
    );

    return result.rows[0];
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {

    const result = await db.query(
      `SELECT password FROM users WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        this.updateLoginTimestamp(username);
        return true;
      }
    }

    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {

    const result = await db.query(
      `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE username = $1 RETURNING last_login_at`,
      [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() {

    const result = await db.query(
      `SELECT username, first_name, last_name, phone
       FROM users`
    );

    return result.rows;
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

    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];

    if (user) return user;
    throw new ExpressError("User not found", 404);
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT
      messages.id,
      messages.to_username AS to_user,
      messages.body,
      messages.sent_at,
      messages.read_at,
      users.username AS to_username,
      users.first_name AS to_first_name,
      users.last_name AS to_last_name,
      users.phone AS to_phone
      FROM messages
      INNER JOIN users ON messages.to_username = users.username
      WHERE messages.from_username = $1`,
      [username]
    );
    const messages = result.rows.map((message) => {
      return {
        id: message.id,
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
        to_user: {
          username: message.to_username,
          first_name: message.to_first_name,
          last_name: message.to_last_name,
          phone: message.to_phone
        }
      }
    });

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT
      messages.id,
      messages.to_username AS to_user,
      messages.body,
      messages.sent_at,
      messages.read_at,
      users.username AS from_username,
      users.first_name AS from_first_name,
      users.last_name AS from_last_name,
      users.phone AS from_phone
      FROM messages
      INNER JOIN users ON messages.from_username = users.username
      WHERE messages.to_username = $1`,
      [username]
    );
    const messages = result.rows.map((message) => {
      return {
        id: message.id,
        body: message.body,
        sent_at: message.sent_at,
        read_at: message.read_at,
        from_user: {
          username: message.from_username,
          first_name: message.from_first_name,
          last_name: message.from_last_name,
          phone: message.from_phone
        }
      }
    });
    console.log(messages);

    return messages;
  }
}


module.exports = User;
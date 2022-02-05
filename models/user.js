/** User class for message.ly */

const { DB_URI, BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const db = require('../db');
const bcrypt = require('bcrypt');
const ExpressError = require('../expressError');
const currentDate = new Date();
/** User of the site. */

class User {

    /** register new user -- returns
     *    {username, password, first_name, last_name, phone}
     */

    constructor(username , password , first_name , last_name , phone) {
      this.username = username;
      this.password = password;
      this.first_name = first_name;
      this.last_name = last_name;
      this.phone = phone;
    }
  
    static async register(username, password, first_name, last_name, phone) { 
      const preCheck = await db.query(`SELECT username FROM users WHERE username=$1` , [username])
      const preCheckRes = preCheck.rows[0];
      if(!preCheckRes) {
        const hashedPassword = await bcrypt.hash(password , BCRYPT_WORK_FACTOR);
        const results = await db.query(`INSERT INTO users (username , password, first_name , last_name , phone , join_at) VALUES ($1 , $2 , $3 , $4, $5 , $6) RETURNING username , first_name , last_name` , [username , hashedPassword , first_name , last_name , phone , currentDate]);
        
        return new User(username , first_name , last_name , phone)
      }else {
        throw new ExpressError('Username already exists' , 401);
      }
        }
  
  
    static async authenticate(username, password) { 
      const checkUser = await db.query(`SELECT user FROM users WHERE username = $1` , [username])
      let existingUser = checkUser.rows[0]
      
      if(existingUser){
  
      const results = await db.query(`UPDATE users SET last_login_at = $1 WHERE username = $2 RETURNING username , password` , [currentDate , username])
      const user= results.rows[0];
        console.log(user)
      if(!user) {
        throw new ExpressError('Invalid Credentials' , 404)
        }
      else {
        if(await bcrypt.compare(password , user.password)) {
          return user
      }else{
        throw new ExpressError('Invalid Credentials' , 404)
      }
    }
  } else{
    throw new ExpressError('Invalid Crednetials' , 404);
  }
}
      
   
  
    static async updateLoginTimestamp(username) { 
      const results = await db.query(`UPDATE users SET last_login_at = $1 WHERE username = $2 RETURNING username` , [currentDate , username])
      return results.rows[0];
    }
  
    
  
    static async all() { 
      const results = await db.query(`SELECT * FROM users`)

      return results.rows;
    }
  
   
  
    static async get(username) {
      const results = await db.query(`SELECT * FROM users WHERE username = $1` , [username]);
      return results.rows;
     }
  
    /** Return messages from this user.
     *
     * [{id, to_user, body, sent_at, read_at}]
     *
     * where to_user is
     *   {username, first_name, last_name, phone}
     */
  
    static async messagesFrom(username) { 
      const results = await db.query(`SELECT m.id, m.to_username , u.first_name , u.last_name, u.phone, m.body , m.sent_at , m.read_at FROM messages AS m JOIN users AS u ON m.to_username = u.username WHERE from_username =$1` , [username]);
      return results.rows.map(m => ({
        id: m.id, 
        to_user: {
          username : m.to_username,
          first_name : m.first_name ,
          last_name : m.last_name , 
          phone: m.phone
        } ,
        body: m.body, 
        sent_at: m.sent_at,
        read_at : m.read_at
      }));
    }
  
    /** Return messages to this user.
     *
     * [{id, from_user, body, sent_at, read_at}]
     *
     * where from_user is
     *   {username, first_name, last_name, phone}
     */
  
    static async messagesTo(username) {
      const results = await db.query(`SELECT m.id , m.from_username , u.first_name , u.last_name , u.phone , m.body , m.sent_at , m.read_at FROM messages AS m JOIN users AS u ON m.from_username = u.username WHERE to_username = $1` , [username])
      return results.rows.map(m => ({
        id: m.id,
        from_user: {
          username : m.from_username,
          first_name : m.first_name ,
          last_naem: m.last_name,
          phone: m.phone,
        } ,
        body: m.body, 
        sent_at: m.sent_at,
        read_at : m.read_at
      }));
     }
  }
  
  
  module.exports = User;
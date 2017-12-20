import express from 'express'
import mysql from 'promise-mysql'
import passport from 'passport'
import { config } from '../config'
import x from '../sample'

console.log(x)
const LocalStrategy = require('passport-local').Strategy
const router = express.Router();

passport.serializeUser(function(user, done) {
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  mysql.createConnection(config).query(`select * from users where id =  ${id}`, function(err, rows) {
    done(err, rows[0]);
  })
})

router.get('/', function(req, res) {
  res.send({ result: 'connected' })
})

// create
router.post('/register', function(req, res) {
  console.log(config)
  const u = req.body.user
  const newUser = {
    first_name: u.firstName,
    last_name: u.lastName,
    email: u.email,
    password: u.password,
  }
  let sql = `SELECT email FROM users WHERE email = '${newUser.email}'`
  mysql.createConnection(config).then((conn) => {
    return conn.query(sql)
  }).then((rows) => {
    console.log('/users/register: rows.length ', rows.length)
    return rows.length;
  }).then((length) => {
    if (length !== 0) {
      res.send({'result': 'user exists'})
    } else {
      sql = "INSERT INTO users SET ?";
      mysql.createConnection(config).then((conn) => {
        let result = conn.query(sql, newUser);
        conn.end()
        return result
      }).then((rows) => {
        console.log('rows', rows)
        res.send(rows)
      })
    }
  })
})

module.exports = router;

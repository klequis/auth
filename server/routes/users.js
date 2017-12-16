import express from 'express'
// import connection from '../db'
import mysql from 'promise-mysql'
const router = express.Router();

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
  connection.query("select * from users where id = " + id, function(err, rows) {
    done(err, rows[0]);
  });
});

// create
router.post('/', function(req, res) {

  const u = req.body.user
  console.log('users.post: u', u)
  // console.log('updated member in:', m)
  const newUser = {
    first_name: u.firstName,
    last_name: u.lastName,
    email: u.email,
    password: u.password,
  }
  // check if user with email already exists
  let sql = `SELECT email FROM users WHERE email = '${newUser.email}'`
  mysql.createConnection(connectionConfig).then((conn) => {
    return conn.query(sql)
  }).then((rows) => {
    console.log('found user: ', rows.length)
    return rows.length;

  }).then((length) => {
    if (length !== 0) {
      // console.log('statusText', res.statusText)
      res.send({'result': 'user exists'})
    } else {
      sql = "INSERT INTO users SET ?";
      mysql.createConnection(connectionConfig).then((conn) => {
        let result = conn.query(sql, newUser);
        conn.end()
        return result
      }).then((rows) => {
        console.log('rows', rows)
        res.send(rows)
      })
    }
  })
  console.log('users.post: u', newUser)
})


router.get('/', function(req, res) {
  // console.log('connectionConfig', connectionConfig)

  let members_sql = `
    SELECT m.member_id AS id, m.first_name AS firstName, m.last_name AS lastName, m.email, m.exempt,
           m.comment, m.phone_number AS phoneNumber, m.active, DATE_FORMAT(h.date, '%Y-%m-%d') AS lastRoleDate, r.role_name AS lastRoleName
    FROM members m
    LEFT JOIN history h ON h.member_id = m.member_id AND (h.date = (SELECT MAX(h1.date) FROM history h1 WHERE h1.member_id = m.member_id))
    LEFT JOIN roles r on r.role_id = h.role_id
    ORDER BY (h.history_id IS NULL) DESC, h.date ASC, m.last_name ASC
  `

  let asort_sql = 'SELECT member_id AS id FROM members ORDER BY last_name ASC'

  let exclusions_sql = `
    SELECT e.member_id AS id, GROUP_CONCAT(r.role_id) AS excludedRoleIds
    FROM exclusions e
    LEFT JOIN roles r ON r.role_id = e.role_id
    GROUP BY e.member_id
  `
  let db
  let asort = [], hsort = []
  let members = {}, exclusions = {}
  mysql.createConnection(connectionConfig).then((conn) => {
    db = conn
    return db.query(asort_sql)  // member IDs sorted by member last name
  }).then((rows) => {
    for (let i = 0; i < rows.length; i++) {
      asort[i] = rows[i]['id']
    }
    // console.log('memberIdsByAlpha', asort)

    return db.query(exclusions_sql)  // role exclusions
  }).then((rows) => {
    let mid
    for (let i = 0; i < rows.length; i++) {
      mid = rows[i]['id']
      exclusions[mid] = rows[i]['excludedRoleIds']
    }
    // console.log('exclusions', exclusions)

    return db.query(members_sql)  // members with history and role exclusions
  }).then((rows) => {
    db.end()
    let mid
    for (let i = 0; i < rows.length; i++) {
      mid = rows[i]['id']
      hsort[i] = mid
      members[mid] = Object.assign({}, rows[i])
      members[mid]['exclusions'] = exclusions[mid]
        ? exclusions[mid].split(',')
        : []
    }
    // console.log('members', members)
    // console.log('memberIdsByLastRoleDate', hsort)

    const members_full = {
      membersById: members,
      idsByAlpha: asort,
      idsByLastRoleDate: hsort,
    }
    // console.log('members_full', members_full)
    res.send(members_full)
  })
})

// update (handles member information updates, active/inactive swtiching)
router.put('/:id', function(req, res) {
  const m = req.body.member
  console.log('updated member in:', m)
  const updatedMember = {
    first_name: m.firstName,
    last_name: m.lastName,
    email: m.email,
    exempt: m.exempt,
    comment: m.comment,
    phone_number: m.phoneNumber,
    active: m.active,
  }
  console.log('updated member reformatted:', updatedMember)
  // the following "placeholder" syntax is explained here: https://www.w3resource.com/node.js/nodejs-mysql.php#Escaping_query
  let sql = "UPDATE members SET ? WHERE member_id = ?";
  mysql.createConnection(connectionConfig).then((conn) => {
    let result = conn.query(sql, [updatedMember, req.params.id])
    conn.end()
    return result
  }).then((rows) => {
    // console.log('rows', rows)
    res.send(rows)
  })
})

// delete
router.delete('/:id', function(req, res) {
  // the following "placeholder" syntax is explained here: https://www.w3resource.com/node.js/nodejs-mysql.php#Escaping_query
  let sql = "DELETE FROM members WHERE member_id = ?";
  mysql.createConnection(connectionConfig).then((conn) => {
    let result = conn.query(sql, req.params.id)
    conn.end()
    return result
  }).then((rows) => {
    console.log('rows /n', rows)
    res.send(rows)
  })
})

module.exports = router;

var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',

  user: 'root',
  password: 'karl'

});
connection.query('rotary_club');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    connection.query("select * from users where id = " + id, function(err, rows) {
      done(err, rows[0]);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    connection.query("select * from users where email = '" + email + "'", function(err, rows) {
      console.log(rows);
      console.log("above row object");
      if (err)
        return done(err);
      if (rows.length) {
        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
      } else {
        var newUserMysql = new Object();
        newUserMysql.email = email;
        newUserMysql.password = password;
        var insertQuery = "INSERT INTO users ( email, password ) values ('" + email + "','" + password + "')";
        console.log(insertQuery);
        connection.query(insertQuery, function(err, rows) {
          newUserMysql.id = rows.insertId;

          return done(null, newUserMysql);
        });
      }
    });
  }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  // we are using named strategies since we have one for login and one for signup
  // by default, if there was no name, it would just be called 'local'

  passport.use('local-login', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
  }, function(req, email, password, done) { // callback with email and password from our form

    connection.query("SELECT * FROM `users` WHERE `email` = '" + email + "'", function(err, rows) {
      if (err)
        return done(err);
      if (!rows.length) {
        return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
      }

      // if the user is found but the password is wrong
      if (!(rows[0].password == password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

      // all is well, return successful user
      return done(null, rows[0]);

    });

  }));

};

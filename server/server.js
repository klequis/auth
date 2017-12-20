import SourceMapSupport from 'source-map-support'
SourceMapSupport.install();
import bodyParser from 'body-parser'
import express from 'express'
import path from 'path'
import { db } from './db'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import expressSession from 'express-session'
import members from './routes/members'
import schedule from './routes/schedule'
import users from './routes/users'
const app = express()

// const connection = {
//     host     : process.env.DB_HOST,
//     user     : process.env.DB_USER,
//     password : process.env.DB_PASS,
//     database : process.env.DB_NAME,
// }
// console.log('**connection**', connection)
// global.connectionConfig = connection

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(require('express-session')({
  secret: 'tvc secret',
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

// app.use('/route01', route01)
app.use('/members', members)
app.use('/schedule', schedule)
app.use('/users', users)

app.set('port', (process.env.PORT || 3001))
app.listen(app.get('port'), () => {
  console.log(`Listening on ${app.get('port')}`)
})

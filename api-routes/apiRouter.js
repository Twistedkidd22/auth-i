const express = require('express')
const session = require('express-session')
const bcrypt = require('bcrypt')

const db = require('../data/db.js');

const router = express.Router();

router.use(
  session({
    name: 'notdefaultanymore',
    secret: 'i drink and i know things',
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 1000
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false
  })
)

router.use(express.json());

router.get('/users', (req, res) => {
  db('users')
  .then(response => {
    if (req.session.username === 'codexx') {
    res.status(200).json(response);
  } else{
    res.status(401).send(`the user '${req.session.username}' is not authorized to view this page`)
  }
  })
  .catch(error => {
    console.log(error.message)
    res.status(404).send('error fetching users...')
  })
})

router.post('/register', (req, res) => {
  req.body.password = bcrypt.hashSync(req.body.password, 14)

  let { username, password } = req.body;
  let user = {
    username,
    password
  }
  db('users')
  .insert(user)
  .then(ids => ({ id: ids[0] }),
  res.status(200).json(user))
    .catch(error => {
      res.status(500).send('error adding user...')
      console.log(error.message)
    })
  })

  router.post('/login', (req, res) => {
    let { username, password } = req.body;
    let credentials = {
      username,
      password
    }

    db('users')
    .where('username', credentials.username).first()
    .then(user => {
      if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
        return res.status(401).json({ error: 'invalid username or password' });
      } else {
        req.session.username = user.username
        return res.status(200).send(`welcome ${user.username}`)
      }
    })
  })

  router.get('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.send('error logging out')
        } else {
          res.send('goodbye...')
        }
      })
    }
  })

module.exports = router;

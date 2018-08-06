const express = require('express')
const bcrypt = require('bcrypt')

const db = require('../data/db.js');

const router = express.Router();

router.use(express.json());

router.get('/users', (req, res) => {
  db('users')
  .then(response => {
    res.status(200).json(response);
  })
  .catch(error => {
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
        return res.status(200).send("...I'm in...")
      }
    })

    // db('users')
    // .insert(user)
    // .then(ids => ({ id: ids[0] }),
    // res.status(200).json(user))
    //   .catch(error => {
    //     res.status(500).send('error adding user...')
    //     console.log(error.message)
    //   })
    })

module.exports = router;

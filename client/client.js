const express = require('express')
const app = express()
const fs = require('fs')
const { uuid } = require('uuidv4');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const isLoggedIn = require('./middleware/authMiddleware')
const axios = require('axios')

app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', './public/views')
// untuk share file secara public
app.use(express.static(__dirname + '/public'))
// middleware untuk parsing body
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', isLoggedIn, async (req, res) => {

  const response = await axios.get('http://localhost:3000/api/hobby')

  res.render('main', {
    pageTitle: "Main",
    data: response.data.data
  })
})

app.get('/add', isLoggedIn, (req, res) => {
  res.render('add.ejs', {
    pageTitle: "Add",
  })
})
// edit cara post

app.post('/add', async (req, res) => {
  const { name, hobby } = req.body
  const newHobby = {
    name,
    hobby
  }

  const response = await axios.post('http://localhost:3000/api/hobby', newHobby)
  // await axios.post('http://localhost:3000/api/hobby', { name: name, hobby: hobby })
  console.log(response);
  if (response.status === 201) {
    res.redirect('/')
  } else {
    res.redirect("/add")
  }
})

app.get('/edit', isLoggedIn, async (req, res) => {
  const { id } = req.query
  const response = await axios.get(`http://localhost:3000/api/hobby/${id}`)

  if (response.data.status === "success") {
    res.render('edit.ejs', {
      pageTitle: "Edit",
      data: response.data.data
    })
  }

})

// edit cara post

app.post('/edit', async (req, res) => {
  const { id } = req.query
  const { name, hobby } = req.body

  const dataToEdit = {
    name: name,
    hobby: hobby
  }

  try {
    const response = await axios.put(`http://localhost:3000/api/hobby/${id}`, dataToEdit)
    res.redirect('/')
  } catch (error) {
    res.redirect(`/edit?id=${id}`)
  }

})



app.post('/delete', async (req, res) => {
  const { id } = req.query
  const response = await axios.delete(`http://localhost:3000/api/hobby?id=${id}`)
  res.redirect('/')
})

app.get('/login', (req, res) => {
  const { status } = req.query
  res.render('login', {
    status
  })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const data = JSON.parse(fs.readFileSync('./data/user.json', 'utf-8'))
  const userMatch = data.find((item) => item.email == email)

  // if userMatch === null atau userMatch === undefined atau userMatch === false
  if (!userMatch) {
    res.redirect('/login?status=emailnotfound')
  } else {
    if (password === userMatch.password) {
      const token = jwt.sign({ //ngunci data (in this case email & user)
        email: userMatch.email,
        id: userMatch.id
      }, 'secret', {
        // expiresIn: 60 * 60 * 24 // 1 hari satuan detik
        expiresIn: 86400 // 1 hari
        // 60 detik dikali 60 detik = 3600 detik = 1 jam
        // 1 jam dikali 24 = 1 hari
      })

      // res.cookie('jwt', token, { maxAge: 1000 * 60 * 60 * 24 })// max age satu hari
      res.cookie('jwt', token, { maxAge: 86400000 })// max age satu hari (satuan milisecon)
      res.redirect('/')
    } else {
      res.redirect('/login?status=wrongpassword')
    }
  }
})


app.get('/set-cookies', (req, res) => {
  // cara vanilla
  // res.setHeader('Set-Cookie', 'userId=1')
  // cara modul cookieParser
  res.cookie('userId', 1)
  res.cookie('username', "Didi", { maxAge: 1000 * 60 * 60 * 24 })
  // max age cookie gunanya untuk masa waktu cookie di dalam browser
  // kalau waktunya habis maka cookie nya akan menghilang
  res.json({
    message: "anda mendapat cookie"
  })
})

const PORT = 5000
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`)
})
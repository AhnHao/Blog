const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const { uuid } = require('uuidv4')
const cors = require('cors')
require('dotenv').config()

const path = require('path')
const multer = require('multer')

const feedRoutes = require('./routes/feed')
const authRoutes = require('./routes/auth')

const app = express()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    cb(null, uuid())
  }
})

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|jfif/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb('Error: image is wrong format')
  }
}

app.use(bodyParser.json())
app.use(multer({ storage: storage, fileFilter: fileFilter }).single('image'))
app.use('/images', express.static(path.join(__dirname, 'images')))

app.options('*', cors())
app.use(cors())
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PACTH, DELETE')
//   res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
//   next()
// })

app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)
app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  res.status(status).json({ message: message })
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(result => {
    const server = app.listen(8080)
    const io = require('./socket').init(server)
    io.on('connection', socket => {
      console.log('Client Connected')
    })
  })
  .catch(err => console.log(err))

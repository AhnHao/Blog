const express = require('express')
const { body } = require('express-validator')

const User = require('../models/user')
const authController = require('../controller/auth')
const isAuth = require('../middleware/is-auth')

const router = express.Router()

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email address already exits.')
          }
        })
      })
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password must least 6 character.'),
    body('name').trim().not().isEmpty()
  ],
  authController.signup
)

router.post('/login', authController.login)

router.get('/status', isAuth, authController.getUserStatus)

router.patch(
  '/status',
  isAuth,
  [body('status').trim().not().isEmpty()],
  authController.updateUserStatus
)

module.exports = router

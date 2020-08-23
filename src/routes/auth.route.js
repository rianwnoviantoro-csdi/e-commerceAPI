const express = require('express')
const router = express.Router()
const { check } = require('express-validator')
const auth = require('../middlewares/auth.middleware')

// Models
const User = require('../controllers/user.controller')

// @route   GET api/user
// @desc    User info
// @access  Private
router.get('/', auth, User.info)

// @route   POST api/user/register
// @desc    Register user
// @access  Public
router.post('/register', [
  // Validation
  check('name', 'Nama tidak boleh kosong').not().isEmpty(),
  check('email', 'Email tidak boleh kosong').isEmail(),
  check('password', 'Silahkan isi password dengan minimal 6 karakter').isLength({
    min: 6
  }),
], User.register)

// @route   POST api/user/login
// @desc    Login user
// @access  Public
router.post('/login', [
  // Validation
  check('email', 'Silahkan masukkan email yang valid').isEmail(),
  check('password', 'Silahkan isi password dengan minimal 6 karakter').isLength({
    min: 6
  }),
], User.login)

module.exports = router
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken'); // Generate token
const bcrypt = require('bcryptjs'); // hash password
// Check validation
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar'); // get user image by email

// Models
const User = require('../models/user.model');

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
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }
  // get name, email and password from request
  const { name, email, password } = req.body

  try {
    // Check if user already exist
    let user = await User.findOne({ email })
    // If user exist
    if (user) {
      return res.status(400).json({
        errors: [
          {
            msg: 'Akun sudah ada'
          }
        ]
      })
    }

    // If not exist
    // get image from gravatar
    const avatar = gravatar.url(email, {
      s: '200', // Size 
      r: 'pg', // Rate
      d: 'mm'
    })

    // Create user object
    user = new User({
      name, email, avatar, password
    })

    // Encrypt password
    const salt = await bcrypt.genSalt(10) // Generate salt contain 10
    // Save encrypt password
    user.password = await bcrypt.hash(password, salt) // Use user password and salt to hash password 
    // Save user in database
    await user.save()

    // payload to generate
    const payload = {
      user: {
        id: user.id
      }
    }

    jwt.sign(
      payload,
      process.env.JWT_SECRET, {
      expiresIn: 360000 // For developtment, for production ut will 3600
    }, (err, token) => {
      if (err) throw err
      res.json({ token })
    }
    )
  } catch (error) {
    console.log(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
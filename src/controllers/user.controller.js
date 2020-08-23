const User = require('../models/user.model')
const jwt = require('jsonwebtoken') // Generate token
const bcrypt = require('bcryptjs') // hash password
// Check validation
const { validationResult } = require('express-validator')
const gravatar = require('gravatar') // get user image by email

const info = async (req, res) => {
  try {
    // Get user info by id
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server error')
  }
}

const register = async (req, res) => {
  // If error
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
  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server error')
  }
}

const login = async (req, res) => {
  const erros = validationResult(req)
  // If error
  if (!erros.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }

  // If everything is good
  // Get email and password
  const { email, password } = req.body

  try {
    // Find user
    let user = await User.findOne({ email })
    // If user not found
    if (!user) {
      return res.status(400).json({
        errors: [{
          msg: 'Invalid credentials'
        }]
      })
    }
    // Known user founded by email let's compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    // Password's dont match
    if (!isMatch) {
      return res.status(400).json({
        errors: [{
          msg: 'Invalid credentials'
        }]
      })
    }
    // Payload for JWT
    const payload = {
      user: {
        id: user.id
      }
    }
    jwt.sign(
      payload,
      process.env.JWT_SECRET, {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err
      res.json({
        token
      })
    }
    )

  } catch (err) {
    console.log(err.message)
    res.status(500).send('Server error')
  }
}

module.exports = { register, login, info }
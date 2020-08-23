const mongoose = require('mongoose')

const connectDB = async () => {
  const connection = await mongoose.connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true
  })
  console.log(`MongoDB Connected: ${connection.connection.host}`)
}

module.exports = connectDB
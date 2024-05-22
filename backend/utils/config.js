require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_CLUSTER_URI = process.env.MONGODB_CLUSTER_URI

let MONGODB_URI
if (process.env.NODE_ENV === 'production') {
  MONGODB_URI = process.env.MONGODB_URI
} else if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI
} else {
  MONGODB_URI = process.env.DEV_MONGODB_URI
}

const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

module.exports = {
  MONGODB_CLUSTER_URI,
  MONGODB_URI,
  PORT,
  EMAIL_PASSWORD
}
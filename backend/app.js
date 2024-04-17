const config = require('./utils/config')
const express = require('express')
const Grid = require('gridfs-stream')
require('express-async-errors')
const app = express()
const cors = require('cors')

const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const projectsRouter = require('./controllers/projects')
const issuesRouter = require('./controllers/issues')
const commentRouter = require('./controllers/comments')
const homeRouter = require('./controllers/home')
const notificationRouter = require('./controllers/notification')

const { daily_job } = require('./schedules/schedule')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')


mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
    daily_job()
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

// // Initialize GridFS
// const connection = mongoose.connection
// let gfs
// connection.once('open', () => {
//   gfs = Grid(connection.db, mongoose.mongo)
//   gfs.collection('files-upload')
// })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)
app.use(middleware.requestLogger)

app.use('/api', homeRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/notification', notificationRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/projects/:projectId/issues', issuesRouter)
app.use('/api/projects/:projectId/issues/:issueId/comments', commentRouter)

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
const config = require('./utils/config')
const express = require('express')
const Grid = require('gridfs-stream')
require('express-async-errors')
const path = require('path')
const app = express()
const cors = require('cors')
const fs = require('fs')

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

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)
app.use(middleware.requestLogger)

app.use('/api', homeRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/projects/:projectId/issues', issuesRouter)
app.use('/api/projects/:projectId/issues/:issueId/comments', commentRouter)
// Serve static files from the 'uploads' directory
const dir = './uploads'
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true })
}
app.use('/uploads', express.static('uploads'))

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// Middleware for serving static files from 'build' directory (React build)
app.use(express.static(path.join(__dirname, 'build')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
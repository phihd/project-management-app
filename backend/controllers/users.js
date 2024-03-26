const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Project = require('../models/project')
const Issue = require('../models/issue')

usersRouter.get('/', async (request, response) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const users = await User
    .find({})
    .populate("projects", { name: 1 })
    .populate('issues', { title: 1 })
  response.json(users)
})

usersRouter.get('/:userId', async (request, response) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(request.params.userId)
  if (user) {
    response.json(user)
  } else {
    response.status(404).end()
  }
})

usersRouter.get('/:userId/projects', async (request, response) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(request.params.userId)
  const projectIds = user.projects
  const projects = Project
    .find({ _id: { $in: projectIds } }) // get all projects based on provided project ids

  response.json(projects)
})

usersRouter.get('/:userId/issues', async (request, response) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(request.params.userId)
  const issueIds = user.issues
  const issues = await Issue
    .find({ _id: { $in: issueIds } }) // get all issues based on provided issue ids
    .populate('project', { name: 1 })
  response.json(issues)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!password) {
    return response.status(400).json({
      error: "Password must be given",
    })
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: "Both username and password must be at least 3 characters long",
    })
  }

  const existingUser = await User.findOne({ username: username })
  if (existingUser) {
    return response.status(400).json({
      error: "Username has been taken",
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter
const jwt = require('jsonwebtoken')
const homeRouter = require('express').Router()
const User = require('../models/user')

homeRouter.get('/', async (request, response) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(404).json({ error: 'user not found' })
  }

  return response.sendStatus(200).end()
})

module.exports = homeRouter
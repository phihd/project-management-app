const jwt = require('jsonwebtoken')
const homeRouter = require('express').Router()

homeRouter.get('/', async (request, response) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  return response.sendStatus(200).end()
})

module.exports = homeRouter
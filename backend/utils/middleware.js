const logger = require('./logger')
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const Comment = require('../models/comment')
const User = require("../models/user")

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    })
  }

  next(error)
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization")
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.replace('Bearer ', '')
  }

  next()
}

const userExtractor = async (request, response, next) => {
  const token = request.token
  if (token) {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    request.user = await User.findById(decodedToken.id)
  }

  next()
}

const uploadFileAndAttachToComment = async (commentId, fileData) => {
  const Comment = mongoose.model('Comment')

  try {
    // Upload the file to GridFS
    const gfs = Grid(mongoose.connection.db, mongoose.mongo)
    const writeStream = gfs.createWriteStream({
      filename: fileData.originalname,
      contentType: fileData.mimetype,
    })

    fileData.stream.pipe(writeStream)

    writeStream.on('close', async (file) => {
      // Associate the file details with the comment
      await Comment.findByIdAndUpdate(
        commentId,
        {
          $push: {
            files: {
              filename: file.filename,
              contentType: file.contentType,
              fileId: file._id,
            },
          },
        },
        { new: true }
      )
    })

    writeStream.on('error', (error) => {
      console.error('Error uploading file:', error)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
  uploadFileAndAttachToComment
}
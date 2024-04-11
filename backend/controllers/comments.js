const jwt = require('jsonwebtoken')
const commentsRouter = require('express').Router({ mergeParams: true }) // Use mergeParams to access the parent route params
const Issue = require('../models/issue')
const Project = require('../models/project')
const CommentModel = require('../models/comment')

commentsRouter.get('/', async (request, response) => {
  const issueId = request.params.issueId
  const comments = await CommentModel
    .find({ issue: issueId })
    .populate('user', { username: 1, name: 1 })
    .populate('issue', { title: 1 })
  response.json(comments)
})

commentsRouter.get('/:commentId', async (request, response) => {
  const commentId = request.params.commentId
  const comment = await CommentModel.findOne({ _id: commentId })
  if (comment) {
    response.json(comment)
  } else {
    response.status(404).end()
  }
})

commentsRouter.post('/', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const { projectId, issueId } = request.params
  const body = request.body
  const user = request.user

  // Fetch the project to verify if the user is a member
  const project = await Project.findById(projectId)
  if (!project || !project.members.includes(user._id)) {
    return response.status(403).json({ error: 'Unauthorized access' })
  }

  const issue = await Issue.findById(issueId)

  const comment = await new CommentModel({
    issue: issue,
    user: user.id,
    versions: [{ text: body.text }]
  }).populate('user', { name: 1 })

  const savedComment = await comment.save()
  issue.comments = issue.comments.concat(savedComment._id)
  await issue.save()

  response.status(201).json(savedComment)
})

commentsRouter.delete('/:commentId', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const id = request.params.id
  const comment = await CommentModel.findById(id)

  if (!comment) {
    response.status(404).json({ error: 'comment id cannot be found' })
  }

  const user = request.user
  if (comment.user.toString() === user.id.toString()) {
    await CommentModel.deleteOne({ _id: id })
    response.sendStatus(204).end()
  } else {
    response.status(401).json({ error: 'comment can be deleted only by the user who created the comment' })
  }
})

commentsRouter.put('/:commentId', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const body = request.body
  const user = request.user
  const commentId = request.params.commentId

  const existingComment = await CommentModel.findOne({ _id: commentId })
  if (!existingComment) {
    return response.status(404).json({ message: 'Comment not found' })
  }

  if ('text' in body && existingComment.user.toString() !== user.id.toString()) {
    return response.status(403).json({ message: 'Comment can only be edited by its creator' })
  }

  const updatedCommentModel = await CommentModel
    .findByIdAndUpdate(id,
      { $push: { versions: { text, timestamp: new Date() } } }, // Append new version
      { new: true })
    .populate('user', { name: 1 })

  response.json(updatedCommentModel)
})

module.exports = commentsRouter
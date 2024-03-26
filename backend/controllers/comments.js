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

commentsRouter.get('/:id', async (request, response) => {
  const { issueId } = request.params.issueId
  const comment = await Issue.findOne({ _id: issueId, issue: issueId })
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
    text: body.text,
    date: body.date,
    issue: issue,
    user: user.id
  }).populate('user', { username: 1, name: 1 })

  const savedComment = await comment.save()
  issue.comments = issue.comments.concat(savedComment._id)
  await issue.save()

  response.status(201).json(savedComment)
})

commentsRouter.delete('/:id', async (request, response, next) => {
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

commentsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  const issueId = request.params.issueId

  const comment = {
    text: body.title,
    date: body.date,
    issue: body.issue,
    user: body.user
  }

  const updatedCommentModel = await CommentModel
    .findByIdAndUpdate({ issue: issueId }, comment, { new: true })
    .populate('user', { name: 1 })
  response.json(updatedCommentModel)
})

module.exports = commentsRouter
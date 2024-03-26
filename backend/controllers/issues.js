const jwt = require('jsonwebtoken')
const issuesRouter = require('express').Router({ mergeParams: true }) // Use mergeParams to access the parent route params
const Issue = require('../models/issue')
const Project = require('../models/project')
const CommentModel = require('../models/comment')

issuesRouter.get('/', async (request, response) => {
  try {
    const projectId = request.params.projectId
    const issues = await Issue
      .find({ project: projectId })
      .populate('creator', { name: 1 })
      .populate('project', { title: 1 })
      .populate('comments', { text: 1 })
    response.json(issues)
  } catch (error) {
    response.status(404).json({ message: error.message })
  }
})

issuesRouter.get('/:issueId', async (request, response) => {
  try {
    const { projectId, issueId } = request.params
    const issue = await Issue.findOne({ _id: issueId, project: projectId })
    if (!issue) {
      return response.status(404).json({ message: 'Issue not found' })
    }
    response.json(issue)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
})

issuesRouter.post('/', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const projectId = request.params.projectId
  const body = request.body
  const user = request.user

  // Fetch the project to verify if the user is a member
  const project = await Project.findById(projectId)
  if (!project || !project.members.includes(user._id)) {
    return response.status(403).json({ error: 'Unauthorized access' })
  }

  const issue = await new Issue({
    title: body.title,
    status: body.status,
    description: body.description,
    dueDate: body.dueDate,
    createdDate: body.createdDate,
    creator: user.id,
    project: projectId
  })

  const savedIssue = await issue.save()
  user.issues = user.issues.concat(savedIssue._id)
  await user.save()
  project.issues = project.issues.concat(savedIssue._id)
  await project.save()

  response.status(201).json(savedIssue)
})

issuesRouter.delete('/:id', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const id = request.params.id
  const issue = await Issue.findById(id)

  if (!issue) {
    response.status(404).json({ error: 'issue id cannot be found' })
  }

  const user = request.user
  if (issue.creator.toString() === user.id.toString()) {
    await Issue.deleteOne({ _id: id })
    response.sendStatus(204).end()
  } else {
    response.status(401).json({ error: 'issue can be deleted only by the user who created the issue' })
  }
})

issuesRouter.put('/:issueId', async (request, response, next) => {
  try {
    const body = request.body
    const { projectId, issueId } = request.params
    const issue = {
      title: body.title,
      status: body.status,
      description: body.description,
      creator: body.creator,
      dueDate: body.dueDate,
      project: projectId,
      comments: body.comments
    }

    const updatedIssue = await Issue
      .findOneAndUpdate({ _id: issueId, projectId }, issue, { new: true })
      .populate('creator', { name: 1 })
      .populate('project', { title: 1 })
      .populate('comments')
    if (!updatedIssue) {
      return response.status(404).json({ message: 'Issue not found' });
    }
    response.json(updatedIssue)
  } catch (error) {
    response.status(400).json({ message: error.message });
  }
})

module.exports = issuesRouter
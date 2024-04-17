const jwt = require('jsonwebtoken')
const helper = require('../utils/helper')
const issuesRouter = require('express').Router({ mergeParams: true }) // Use mergeParams to access the parent route params
const Issue = require('../models/issue')
const User = require('../models/user')
const Project = require('../models/project')
const performDueIssueCheck = require('../schedules/jobs/dueIssueCheck')

issuesRouter.get('/', async (request, response) => {
  try {
    const projectId = request.params.projectId
    const issues = await Issue
      .find({ project: projectId })
      .populate('creator', { name: 1 })
      .populate('assignees', { name: 1 })
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
    assignees: body.assignees,
    project: projectId
  })

  const savedIssue = await issue.save()
  await Promise.all([
    ...savedIssue.assignees.map(assigneeId =>
      User.findByIdAndUpdate(assigneeId, {
        $push: { assignedIssues: savedIssue._id }
      })
    ),
    User.findByIdAndUpdate(user._id, {
      $push: { createdIssues: savedIssue._id }
    }),
    Project.findByIdAndUpdate(projectId, {
      $push: { issues: savedIssue._id }
    })
  ])

  await performDueIssueCheck()

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
    const token = request.token
    if (!token) {
      return response.status(401).json({ error: 'token missing' })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const body = request.body
    const { projectId, issueId } = request.params
    const user = request.user

    const existingIssue = await Issue.findOne({ _id: issueId, project: projectId })

    if (!existingIssue) {
      return response.status(404).json({ message: 'Issue not found' })
    }

    const update = { ...body }

    if ('status' in body && body.status != existingIssue.status && existingIssue.creator.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'Only creator can close or reopen an issue' })
    }
    if ('assignees' in body && !helper.listEqual(body.assignees, existingIssue.assignees) && existingIssue.creator.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'Only creator can change assignees' })
    }
    if ('dueDate' in body && !helper.areDatesSameDay(body.dueDate, existingIssue.dueDate) && existingIssue.creator.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'Only creator can change due date' })
    }

    const updatedIssue = await Issue.findOneAndUpdate(
      { _id: issueId, project: projectId },
      update,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!updatedIssue) {
      return response.status(404).json({ message: 'Issue not found after update attempt' })
    }

    response.json(updatedIssue)
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

module.exports = issuesRouter
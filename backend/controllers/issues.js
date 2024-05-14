const jwt = require('jsonwebtoken')
const helper = require('../utils/helper')
const issuesRouter = require('express').Router({ mergeParams: true }) // Use mergeParams to access the parent route params
const Issue = require('../models/issue')
const User = require('../models/user')
const Project = require('../models/project')
const CommentModel = require('../models/comment')
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
    const issueId = request.params.issueId
    const issue = await Issue
      .findOne({ _id: issueId })
      .populate('creator', { name: 1 })
      .populate('assignees', { name: 1 })
      .populate('project', { title: 1 })
      .populate('comments', { text: 1 })
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
    description: {
      text: body.description.text,
      user: user.id,
      versions: [{ text: body.description.text, user: user.id }]
    },
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

  await performDueIssueCheck(savedIssue._id)

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
    await CommentModel.deleteMany({ issue: issue.id })
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

    const projectId = request.params.projectId
    const body = request.body
    const issueId = request.params.issueId
    const user = request.user

    // Fetch the project to verify if the user is a member  
    const project = await Project.findById(projectId)
    if (!project || !project.members.includes(user._id)) {
      return response.status(403).json({ error: 'Unauthorized access' })
    }

    if (['createdDate', 'creator', 'project'].some(field => field in body)) {
      return response.status(400).json({ message: 'Immutable field cannot be updated' })
    }
    if ('dueDate' in body) {
      body.dueDate = new Date(body.dueDate)
    }

    const existingIssue = await Issue.findOne({ _id: issueId })

    if (!existingIssue) {
      return response.status(404).json({ message: 'Issue not found' })
    }

    if ('dueDate' in body) {
      body.dueDate = new Date(body.dueDate)
    }

    // Field that only creator can modify
    if ('status' in body && body.status != existingIssue.status && existingIssue.creator.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'Only creator can close or reopen an issue' })
    }
    if ('assignees' in body && !helper.listEqual(body.assignees, existingIssue.assignees) && existingIssue.creator.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'Only creator can change assignees' })
    }
    if ('dueDate' in body && !helper.areDatesSameDay(body.dueDate, existingIssue.dueDate) && existingIssue.creator.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'Only creator can change due date' })
    }

    // Handle description change with versioning
    if ('description' in body && body.description.text !== existingIssue.description.text) {
      if (!(existingIssue.creator.equals(user.id) || existingIssue.assignees.some(assignee => assignee.equals(user.id)))) {
        return response.status(403).json({ message: 'Only creator or assignees can edit description' })
      }
      // Push current description to versions array
      existingIssue.description.versions.push({
        text: body.description.text,
        user: user.id
      })

      // Update current description to new value
      existingIssue.description.text = body.description.text
      existingIssue.description.user = user.id
    }

    if ('assignees' in body) {
      const currentAssigneeIds = new Set(existingIssue.assignees.map(a => a.toString()))
      const newAssigneeIds = new Set(body.assignees)

      const assigneesToAdd = body.assignees.filter(id => !currentAssigneeIds.has(id))
      const assigneesToRemove = [...currentAssigneeIds].filter(id => !newAssigneeIds.has(id))

      const addPromises = assigneesToAdd.map(assigneeId =>
        User.findByIdAndUpdate(assigneeId, {
          $push: { assignedIssues: existingIssue._id }
        })
      )

      const removePromises = assigneesToRemove.map(assigneeId =>
        User.findByIdAndUpdate(assigneeId, {
          $pull: { assignedIssues: existingIssue._id }
        })
      )

      await Promise.all([...addPromises, ...removePromises])
    }

    Object.keys(body).forEach(key => {
      if (key !== 'description') {
        existingIssue[key] = body[key]
      }
    })

    await existingIssue.save()

    const updatedIssue = await Issue.findById(issueId)
      .populate('creator', 'name')
      .populate('assignees', 'name')
      .populate('project', 'title')
      .populate('comments', 'text')
    if (!updatedIssue) {
      return response.status(404).json({ message: 'Issue not found after update attempt' })
    }

    // TODO: if add more assignees, pop up noti for extra assignees only
    if (['dueDate'].some(field => field in body)) {
      await performDueIssueCheck(updatedIssue._id)
    }

    response.json(updatedIssue)
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

module.exports = issuesRouter
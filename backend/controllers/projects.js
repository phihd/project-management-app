const jwt = require('jsonwebtoken')
const projectsRouter = require('express').Router()
const Project = require('../models/project')
const User = require('../models/user')
const Issue = require('../models/issue')

projectsRouter.get('/', async (request, response) => {
  const projects = await Project
    .find({})
    .populate('members', { name: 1 })
  response.json(projects)
})

projectsRouter.get('/:id', async (request, response) => {
  const project = await Project
    .findById(request.params.id)
    .populate('members', { name: 1 })
  if (project) {
    response.json(project)
  } else {
    response.status(404).end()
  }
})

projectsRouter.post('/', async (request, response, next) => {
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
  const project = await new Project({
    name: body.name,
    status: body.status,
    department: body.department,
    members: body.members,
    description: body.description,
  })

  const savedProject = await project.save()

  for (const memberId of body.members) {
    const currentUser = await User.findById(memberId)
    if (currentUser) {
      currentUser.projects = currentUser.projects.concat(savedProject._id)
      await currentUser.save()
    }
  }

  response.status(201).json(savedProject)
})

projectsRouter.delete('/:id', async (request, response, next) => {
  const token = request.token
  if (!token) {
    return response.status(401).json({ error: 'token missing' })
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const id = request.params.id
    const project = await Project.findById(id)

    if (!project) {
      return response.status(404).json({ error: 'project id cannot be found' })
    }

    const user = request.user

    // Check if the user is a member of the project
    if (!project.members.includes(user.id)) {
      return response.status(401).json({
        error: 'project can be deleted only by the members in the project',
      })
    }

    // Delete project references from users
    await User.updateMany(
      { _id: { $in: project.members } },
      { $pull: { projects: project._id } }
    )

    await Issue.deleteMany({ project: project._id })

    await Project.deleteOne({ _id: id })

    return response.sendStatus(204).end()
  } catch (error) {
    return response.status(500).json({ error: 'An error occurred while deleting the project' })
  }
})

projectsRouter.put('/:id', async (request, response, next) => {
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

    const currentProject = await Project.findById(request.params.id).populate('members', 'id')
    if (!currentProject) {
      return response.status(404).json({ error: 'Project not found' })
    }

    const currentMemberIds = new Set(currentProject.members.map(member => member.id.toString()))
    const newMembers = body.members.filter(id => !currentMemberIds.has(id))
    const removedMembers = currentProject.members.filter(
      member => !body.members.some(newMember => newMember === member._id.toString())
    )

    const project = {
      name: body.name,
      status: body.status,
      department: body.department,
      members: body.members,
      description: body.description,
    }
    const updatedProject = await Project
      .findByIdAndUpdate(request.params.id, project, { new: true })
      .populate('members', { username: 1, name: 1 })

    await Promise.all([
      ...newMembers.map(member =>
        User.findByIdAndUpdate(member, { $push: { projects: updatedProject._id } })
      ),
      ...removedMembers.map(member =>
        User.findByIdAndUpdate(member._id, { $pull: { projects: updatedProject._id } })
      )
    ])

    response.json(updatedProject)
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

module.exports = projectsRouter
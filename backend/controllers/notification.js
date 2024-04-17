const jwt = require('jsonwebtoken')
const helper = require('../utils/helper')
const notificationRouter = require('express').Router()
const Notification = require('../models/notification')

// Helper function to delete oldest notifications if count exceeds limit
const maintainNotificationLimit = async (userId, limit = 5000) => {
  const notificationCount = await Notification.countDocuments({ user: userId })

  if (notificationCount > 5000) {
    // Find how many notifications to remove
    const excessCount = notificationCount - limit

    // Find the oldest notifications to remove
    const notificationsToRemove = await Notification.find({ user: userId })
      .sort({ createdAt: 1 }) // Oldest first
      .limit(excessCount)

    // Extract their IDs
    const notificationIdsToRemove = notificationsToRemove.map(notification => notification._id)

    // Remove the excess notifications
    await Notification.deleteMany({ _id: { $in: notificationIdsToRemove } })
  }
}

notificationRouter.get('/', async (request, response) => {
  try {
    const token = request.token
    if (!token) {
      return response.status(401).json({ error: 'token missing' })
    }

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const userId = request.user.id

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }) // Get most recent notifications first
      .limit(50) // Limit to 50 notifications for fetching

    response.status(200).json(notifications)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
})

notificationRouter.post('/', async (request, response) => {
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
    const user = request.user

    const newNotification = new Notification({
      user: user.id,
      message: body.message,
      url: body.url
    })

    await newNotification.save()

    // Ensure only the latest notifications are kept
    await maintainNotificationLimit(user.id)

    response.status(201).json(newNotification)
  } catch (error) {
    response.status(500).json({ message: error.message })
  }
})

notificationRouter.put('/:notificationId', async (request, response, next) => {
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
    const notificationId = request.params.notificationId
    const user = request.user

    const existingNotification = await Notification.findOne({ _id: notificationId })

    if (!existingNotification) {
      return response.status(404).json({ message: 'Notification not found' })
    }

    const update = { ...body }

    if ('update' in body && existingNotification.user.toString() !== user.id.toString()) {
      return response.status(403).json({ message: 'You cannot read this notification' })
    }

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: notificationId, project: projectId },
      update,
      { new: true }
    )

    if (!updatedNotification) {
      return response.status(404).json({ message: 'Notification not found after update attempt' })
    }

    response.json(updatedNotification)
  } catch (error) {
    response.status(400).json({ message: error.message })
  }
})

module.exports = notificationRouter
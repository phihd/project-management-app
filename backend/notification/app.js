const Notification = require('../models/notification')

const createAppNotification = async ({ user, message, url }) => {
  try {
    const notification = new Notification({
      user,
      message,
      url,
    })

    await notification.save()
    console.log('Notification created successfully')
  } catch (error) {
    console.error('Error creating notification:', error)
  }
}

module.exports = createAppNotification

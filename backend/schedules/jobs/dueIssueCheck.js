const Issue = require('../../models/issue')
const sendEmailNotification = require('../../notification/email')
const createAppNotification = require('../../notification/app')

const performDueIssueCheck = async () => {
  console.log('Performing the due issue check')
  try {
    const now = new Date()
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const issuesDueSoon = await Issue.find({
      dueDate: { $gte: now, $lte: twentyFourHoursLater },
      status: 'Open',  
      isNotified: { $ne: true }
    }).populate('assignees', 'email name')

    for (const issue of issuesDueSoon) {
      const notificationPromises = issue.assignees.map(async (assignee) => {
        if (assignee.email) {
          await sendEmailNotification(assignee.email, `Issue "${issue.title}" is due soon.`)
          await createAppNotification(assignee.id, `Issue "${issue.title}" is due within 24 hours.`)
        }
      })

      await Promise.all(notificationPromises)

      await Issue.findByIdAndUpdate(issue._id, { isNotified: true })
    }
  } catch (error) {
    console.error('Error during due issue check:', error)
  }
}

module.exports = performDueIssueCheck
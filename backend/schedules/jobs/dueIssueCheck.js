const Issue = require('../../models/issue')
const sendEmailNotification = require('../../notification/email')
const createAppNotification = require('../../notification/app')

const performDueIssueCheck = async (issueId = null) => {
  console.log('Performing the due issue check')
  try {
    const now = new Date()
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    let query = {
      dueDate: { $gte: now, $lte: twentyFourHoursLater },
      status: 'Open',
    }
    if (issueId) {
      // Specific issue query without considering 'isNotified' status
      query = { _id: issueId }
    } else {
      // General query includes only issues not yet notified
      query.isNotified = { $ne: true }
    }

    const issuesDueSoon = await Issue.find(query).populate('assignees', 'email name')

    await Promise.all(issuesDueSoon.map(async (issue) => {
      await Promise.all(issue.assignees.map(async (assignee) => {
        if (assignee.email) {
          await sendEmailNotification(assignee.email, `Issue "${issue.title}" is due soon.`)
          }
        await createAppNotification({
          user: assignee.id,
          message: `Issue "${issue.title}" is due within 24 hours.`,
          url: 'www.google.com'
        })
      }))

      await Issue.findByIdAndUpdate(issue._id, { isNotified: true })
    }))

  } catch (error) {
    console.error('Error during due issue check:', error)
  }
}

module.exports = performDueIssueCheck
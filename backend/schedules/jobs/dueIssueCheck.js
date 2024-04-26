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
      isNotified: { $ne: true },
    }

    if (issueId) {
      query = {
        _id: issueId,
        dueDate: { $gte: now, $lte: twentyFourHoursLater },
        status: 'Open'
      }
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
          url: `/project/${issue.project.toString()}/${issue._id}`
        })
      }))

      await Issue.findByIdAndUpdate(issue._id, { isNotified: true })
    }))

  } catch (error) {
    console.error('Error during due issue check:', error)
  }
}

module.exports = performDueIssueCheck
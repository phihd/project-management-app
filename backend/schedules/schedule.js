const cron = require('node-cron')
const moment = require('moment-timezone')
const Issue = require('../models/issue')
const performDueIssueCheck = require('./jobs/dueIssueCheck')

const getTimeForCron = (hour, timezone) => {
  return moment().tz(timezone).startOf('day').add(hour, 'hours').format('m H * * *');
}

const cronTime = getTimeForCron(6, 'Asia/Ho_Chi_Minh') // Get cron time for 6 AM in HCMC

const daily_job = () => {
  console.log('Schedule for daily job is set')
  // Run at 6AM every day
  cron.schedule(cronTime, async () => {
    console.log('Daily Cron job triggered')
    await performDueIssueCheck()
  })
}

const manual_job = () => {
  const task = cron.schedule('* * * * *', async () => {
    console.log("Manual Cron job triggered")
    await performDueIssueCheck()
  }, {
    scheduled: false  // Prevent the task from auto-starting
  })

  task.start()
}

module.exports = { daily_job, manual_job }


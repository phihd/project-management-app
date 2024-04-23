const nodemailer = require('nodemailer')
const config = require('../utils/config')

// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Your SMTP server
  port: 587,
  secure: false, // True for 465, false for other ports
  auth: {
    user: 'scqc.issue.tracker@gmail.com',
    pass: config.EMAIL_PASSWORD
  },
})

const sendEmailNotification = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: '"SCQC Issue Tracker" scqc.issue.tracker@gmail.com', // Sender address
      to, // List of receivers
      subject, // Subject line
      text, // Plain text body
    })

    console.log('Email sent successfully')
  } catch (error) {
    console.error('Error sending email:', error)
  }
}

module.exports = sendEmailNotification

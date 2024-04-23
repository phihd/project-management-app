const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  passwordHash: String,
  email: String,
  projects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ],
  issues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    }
  ],
  createdIssues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    }
  ],
  assignedIssues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})

userSchema.plugin(uniqueValidator) 

module.exports = mongoose.model('User', userSchema)
const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema({
  activityStatus: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  progressStatus: {
    type: String,
    enum: ['Behind Schedule', 'On Schedule'],
    default: 'On Schedule',
  },
  completionStatus: {
    type: String,
    enum: ['Completed', 'Incompleted', 'Overdue'],
    default: 'Incompleted',
  },
})

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  permissions: {
    type: [String],
    enum: ['canCreateIssue'],
    default: [],
  },
})

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: statusSchema,
    default: function () {
      return this.status || {} // checks if this.status exists and returns; otherwise, it returns an empty object {}
    },
  },
  department: {
    type: String,
  },

  description: {
    type: String,
  },
  members: [memberSchema],
  issues: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
    }
  ],
})

projectSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Project', projectSchema)
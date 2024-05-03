const mongoose = require('mongoose')

const actionSchema = new mongoose.Schema({
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

const descriptionVersionSchema = new mongoose.Schema({
  text: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false }); // Prevent separate _id for versions

const descriptionSchema = new mongoose.Schema({
  // text and timestamp of the latest version
  text: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  versions: [descriptionVersionSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
})

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Open', 'Close'],
    default: 'Open',
  },
  description: {
    type: descriptionSchema,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ],
  dueDate: {
    type: Date,
    default: Date.now() + 30
  },
  createdDate: {
    type: Date,
    default: Date.now()
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  actionHistory: [actionSchema],
})

issueSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Issue', issueSchema)
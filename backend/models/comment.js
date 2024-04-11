const mongoose = require('mongoose')

const commentVersionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
}, { _id: false }); // Prevent separate _id for versions

const commentSchema = new mongoose.Schema({
  // text and timestamp of the latest version
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  versions: [commentVersionSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true,
  },
  // files: [
  //   {
  //     filename: String,
  //     contentType: String,
  //     fileId: mongoose.Schema.Types.ObjectId, // Reference to the file in GridFS
  //   },
  // ],
})

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Comment', commentSchema)
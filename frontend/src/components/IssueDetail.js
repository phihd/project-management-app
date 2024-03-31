/* eslint-disable */

import React, { useState, useEffect } from 'react'
import './IssueDetail.css' // Import your CSS file
import { useParams, Link } from 'react-router-dom'
import issueService from '../services/issues'
import commentService from '../services/comments'

const IssueDetail = ({ projects }) => {

  const [issues, setIssues] = useState([])
  const [issue, setIssue] = useState(null)
  const [commentInput, setCommentInput] = useState('')
  const [files, setFiles] = useState([])
  const [comments, setComments] = useState([])

  const { projectId, issueId } = useParams()

  // Find the project data based on the projectId
  const project = projects.find((project) => project.id === projectId)


  useEffect(() => {
    if (projects.length > 0 && project.id) {
      issueService.getAll(project.id).then(issues => {
        const foundIssue = issues.find(issue => issue.id === issueId)
        setIssue(foundIssue)
        commentService.getAll(projectId, issueId).then(comments => {
          setComments(comments)
        })
      })
    }
  }, [projects])



  const updateIssue = async (id, issueToUpdate) => {
    try {
      const updatedIssue = await issueService.update(id, issueToUpdate)
      const newIssues = issues.map(
        issue => issue.id === id ? updatedIssue : issue
      )
      setIssues(newIssues)
    } catch (exception) {
      console.log(exception.response.data.error)
    }
  }

  const createComment = async (newComment) => {
    const comment = await commentService.create(projectId, issueId, newComment)
    setComments(comments.concat(comment))
  }

  const handleCommentInput = (event) => {
    setCommentInput(event.target.value)
  }

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files)
    setFiles(selectedFiles)
  }

  const handleAddComment = () => {
    if (commentInput.trim() !== '') {
      const newComment = {
        text: commentInput,
        timestamp: new Date().toLocaleString(), // Current timestamp
        // files: files,
      }
      createComment(newComment)
      setCommentInput('')
      setFiles([])
    }
  }


  return (
    <div className="issue-detail">
      {issue && <div>
        <div className="issue-header">
          <h2 className="issue-title">#1 {issue.title} </h2>
          <span className="issue-status">{issue.status}</span>
          <p className="issue-meta">
            <span className="issue-info">Opened by {issue.creator.name}</span>
            <span className="issue-info">Created on {
              new Date(issue.createdDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}</span>
            <span
              className="issue-info">
              Due on {
                new Date(issue.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
            </span>
          </p>
        </div>
        <div className="issue-body">
          <div className="issue-description">
            <h3>Description</h3>
            <p className="issue-description-text">
              {issue.description}
            </p>
          </div>
          <div className="issue-details">
            <h3>Details</h3>
            <div className="issue-labels">
              <span className="label">Bug</span>
              <span className="label">Feature Request</span>
              {/* Add more labels */}
            </div>
            <div className="assignee">
              <p>Assigned to {issue.assignees.map(assignee => assignee.name).join(', ')} </p>
            </div>
          </div>
          <div className="issue-comments">
            <h3>Comments</h3>
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((comment, index) => (
                <div className="comment" key={index}>
                  <p className="comment-user">{comment.user.name} commented on {comment.timestamp}</p>
                  <p className="comment-text">{comment.text}</p>
                  {/* {comment.files.length > 0 && (
                    <div className="comment-files">
                      Attached Files:
                      <ul>
                        {comment.files.map((file, fileIndex) => (
                          <li key={fileIndex}>
                            <a href={URL.createObjectURL(file)} download={file.name}>
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )} */}
                </div>
              ))
            )}
            {/* More comments can be added here */}
          </div>
          <div className="add-comment">
            <h3>Add Comment</h3>
            <textarea
              className="comment-input"
              placeholder="Leave a comment"
              value={commentInput}
              onChange={handleCommentInput}
            ></textarea>
            {/* <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileUpload}
            /> */}
            <button className="comment-button" onClick={handleAddComment}>Comment</button>
          </div>
        </div>
      </div>}
    </div>
  )
}

export default IssueDetail

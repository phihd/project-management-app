/* eslint-disable */

import React, { useState, useEffect, useContext } from 'react'
import './IssueDetail.css' // Import your CSS file
import { useParams, Link } from 'react-router-dom'
import issueService from '../services/issues'
import userService from '../services/users'
import commentService from '../services/comments'
import UserContext from './UserContext'

const IssueDetail = ({ projects }) => {

  const [issues, setIssues] = useState([])
  const [issue, setIssue] = useState(null)
  const [commentInput, setCommentInput] = useState('')
  const [files, setFiles] = useState([])
  const [comments, setComments] = useState([])
  const { user } = useContext(UserContext)
  const [isAssigneeEditMode, setIsAssigneeEditMode] = useState(false)
  const [assigneeInput, setAssigneeInput] = useState('')
  const { projectId, issueId } = useParams()
  const [currentStatus, setCurrentStatus] = useState('')
  const [dueDateInput, setDueDateInput] = useState('');
  const [isDueDateEditMode, setIsDueDateEditMode] = useState(false);


  // Find the project data based on the projectId
  const project = projects.find((project) => project.id === projectId)

  useEffect(() => {
    if (projects.length > 0 && project.id) {
      issueService.getAll(project.id).then(issues => {
        const foundIssue = issues.find(issue => issue.id === issueId)
        setIssue(foundIssue)
        setCurrentStatus(foundIssue.status)
        commentService.getAll(projectId, issueId).then(comments => {
          setComments(comments)
        })
      })
    }
  }, [projects])

  const toggleAssigneeEditMode = () => {
    setIsAssigneeEditMode(!isAssigneeEditMode);
    // Set initial value of assignee input field to current assignee
    setAssigneeInput(issue.assignee);
  }

  const updateAssignee = async (newAssignees) => {
    try {
      // Map the new assignees to their corresponding IDs
      const assigneeIds = newAssignees.map(assignee => assignee.id);
      // Update the issue assignees in the backend
      await issueService.update(projectId, issueId, { assignees: assigneeIds });
      // Update the issue assignees in the UI
      setIssue(prevIssue => ({ ...prevIssue, assignees: newAssignees }));
    } catch (exception) {
      console.log(exception);
      throw new Error('Failed to update assignees: ' + exception);
    }
  };
  
  const handleAssigneeUpdate = async () => {
    try {
      // Retrieve user IDs for selected assignees
      const selectedAssigneeUsers = assigneeInput.map(assigneeName => project.members.find(user => user.name === assigneeName));
      // Call updateAssignee function with selected assignees
      await updateAssignee(selectedAssigneeUsers); 
      // Once updated, toggle off edit mode
      setIsAssigneeEditMode(false); 
    } catch (error) {
      console.error('Error updating assignees:', error);
    }
  };

  const handleStatusButtonClick = async () => {
    if (issue) {
      const newStatus = currentStatus === 'Open' ? 'Close' : 'Open';
      try {
        await updateIssue(projectId, issueId, { status: newStatus })
        setCurrentStatus(newStatus);
      } catch (error) {
        console.error('Error updating issue status:', error);
      }
    } else {
      console.error('Issue data not available');
    }
  };

  const updateIssue = async (projectId, issueId, issueToUpdate) => {
    try {
      const updatedIssue = await issueService.update(projectId, issueId, issueToUpdate)
      const newIssues = issues.map(
        issue => issue.id === id ? updatedIssue : issue
      )
      setIssues(newIssues)
    } catch (exception) {
      console.log(exception)
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
        timestamp: new Date().toLocaleString(), 
      }
      createComment(newComment)
      setCommentInput('')
      setFiles([])
    }
  }

  const updateDueDate = async (newDueDate) => {
    try {
      // Update the issue due date in the backend
      await issueService.update(projectId, issueId, { dueDate: newDueDate })
      // Update the issue due date in the UI
      setIssue(prevIssue => ({ ...prevIssue, dueDate: newDueDate }))
    } catch (exception) {
      console.log(exception)
      throw new Error('Failed to update due date: ' + exception)
    }
  };

  const toggleDueDateEditMode = () => {
    setIsDueDateEditMode(!isDueDateEditMode)
    setDueDateInput(issue.dueDate)
  }

  const handleDueDateUpdate = async () => {
    try {
      await updateDueDate(dueDateInput)
      setIsDueDateEditMode(false)
    } catch (error) {
      console.error('Error updating due date:', error)
    }
  }

  const formatDate = (dueDate) => {
    const date = new Date(dueDate)
    const year = date.getFullYear()
    let month = (1 + date.getMonth()).toString()
    month = month.length > 1 ? month : '0' + month
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day
    return day + '/' + month + '/' + year
  }

  return (
    <div className="issue-detail">
      {issue && <div>
        <div className="issue-header">
          <h2 className="issue-title">#1 {issue.title} </h2>

          
          {issue.creator.id === user.id && <div>
            <button
              className={`issue-status ${currentStatus.toLowerCase()}`}
              onClick={handleStatusButtonClick}
            >
              {currentStatus}
          </button>
          </div>
          }
          {issue.creator.id != user.id && <div>
            <span className = "issue-status"> Open </span>
            </div>
          }

          <p classNameI="issue-meta">
            <span className="issue-info">Opened by {issue.creator.name}</span>
            <span className="issue-info">Created on {
              new Date(issue.createdDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}</span>
            <span className="issue-info">
              Due on {formatDate(issue.dueDate)}
              {user.id === issue.creator.id && (
                <span>
                  {!isDueDateEditMode && (
                    <button onClick={toggleDueDateEditMode}>Edit Due Date</button>
                  )}
                  {isDueDateEditMode && (
                    <div>
                      <input
                        type="date"
                        value={dueDateInput}
                        onChange={(e) => setDueDateInput(e.target.value)}
                      />
                      <button onClick={handleDueDateUpdate}>Update Due Date</button>
                    </div>
                  )}
                </span>
              )}
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

            {issue.creator.id != user.id && <div className="assignee">
              <p>Assigned to {issue.assignees.map(assignee => assignee.name).join(', ')} </p>
              </div>}

            {issue.creator.id === user.id && (
            <div className="assignee">
              <p>Assigned to {issue.assignees.map(assignee => assignee.name).join(', ')} </p>
              {/* Render edit button for assignee if user is the creator */}
              <button onClick={toggleAssigneeEditMode}>Edit Assignee</button>
              {/* Render select input for assignee if in edit mode */}
              {isAssigneeEditMode && (
                <div>
                  <select
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(Array.from(e.target.selectedOptions, option => option.value))}
                    multiple
                  >
                    <option value="">Select Assignee</option>
                    {project.members.map(user => (
                      <option key={user.id} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={handleAssigneeUpdate}>Update Assignee</button>
                </div>
              )}
            </div>
          )}
            
            
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
              <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileUpload}
            />
          </div>
          <button className="comment-button" onClick={handleAddComment}>Comment</button>
        </div>
      </div>}
    </div>
  )
}

export default IssueDetail
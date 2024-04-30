/* eslint-disable */

import React, { useState, useEffect, useContext } from 'react'
import './IssueDetail.css'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import issueService from '../services/issues'
import projectService from '../services/projects'
import commentService from '../services/comments'
import UserContext from './UserContext'
import { useNavigate } from 'react-router-dom'
import { set } from 'date-fns'

import back_project from '../img/left.png'
import open_status from '../img/open_issue.png'
import close_status from '../img/close_issue.png'
import edit_button from '../img/edit_button.png'
import edit_description_button from '../img/edit_description.png'
import downArrow from '../img/down-arrow.png'

const IssueDetail = ({ projects }) => {

  const [files, setFiles] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const { user } = useContext(UserContext)
  const [isAssigneeEditMode, setIsAssigneeEditMode] = useState(false)
  const [assigneeInput, setAssigneeInput] = useState('')
  const { projectId, issueId } = useParams()
  const [currentStatus, setCurrentStatus] = useState('')
  const [dueDateInput, setDueDateInput] = useState('')
  const [isDueDateEditMode, setIsDueDateEditMode] = useState(false)
  const [isTitleEditMode, setIsTitleEditMode] = useState(false)
  const [titleInput, setTitleInput] = useState('')
  const [isDescriptionEditMode, setIsDescriptionEditMode] = useState(false)
  const [descriptionInput, setDescriptionInput] = useState('')
  const [descriptionHistory, setDescriptionHistory] = useState([])
  const [titleHistory, setTitleHistory] = useState([])
  const [assigneeHistory, setAssigneeHistory] = useState([])
  const [dueDateHistory, setDueDateHistory] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [actionHistory, setActionHistory] = useState([])
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedCommentText, setEditedCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [currentHistoryItem, setCurrentHistoryItem] = useState(null)
  const [showHistoryList, setShowHistoryList] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()


  // Fetch project details
  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErrorMessage
  } = useQuery(['project', projectId], () => projectService.get(projectId), {
    enabled: !!projectId
  })

  // Fetch issue details
  const {
    data: issue,
    isLoading: issueLoading,
    isError: issueError,
    error: issueErrorMessage
  } = useQuery(['issue', issueId], () => issueService.get(projectId, issueId), {
    enabled: !!issueId,
    onSuccess: (data) => {
      setCurrentStatus(data.status)
      setActionHistory(data.actionHistory)
    }
  })

  // Fetch comments for the issue
  const {
    data: comments,
    isLoading: commentsLoading,
    isError: commentsError,
    error: commentsErrorMessage
  } = useQuery(['comments', issueId], () => commentService.getAll(projectId, issueId), {
    enabled: !!issueId
  })

  const toggleAssigneeEditMode = () => {
    setIsAssigneeEditMode(!isAssigneeEditMode)
    setAssigneeInput(issue.assignee)
  }

  const updateAssignee = async (newAssignees) => {
    try {
      const assigneeIds = newAssignees.map(assignee => assignee.id)
      await issueService.update(projectId, issueId, { assignees: assigneeIds })
      queryClient.setQueryData(['issue', issueId], prevIssue => ({ ...prevIssue, assignees: newAssignees }))
      const assigneeNames = newAssignees.map(assignee => assignee.name).join(', ')
      const assignedTo = assigneeNames ? `assigned to ${assigneeNames}` : 'unassigned'
      const editedAssignee = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        assignee: assignedTo,
      }
      setAssigneeHistory([...assigneeHistory, editedAssignee])
    } catch (exception) {
      console.log(exception)
      throw new Error('Failed to update assignees: ' + exception)
    }
  }

  const handleAssigneeUpdate = async () => {
    try {
      const selectedAssigneeUsers = assigneeInput.map(assigneeName => project.members.find(user => user.name === assigneeName))
      await updateAssignee(selectedAssigneeUsers)
      setIsAssigneeEditMode(false)
    } catch (error) {
      console.error('Error updating assignees:', error)
    }
  }

  const handleStatusButtonClick = async () => {
    if (issue) {
      const newStatus = currentStatus === 'Open' ? 'Close' : 'Open'
      try {
        await updateIssue(projectId, issueId, { status: newStatus })
        setCurrentStatus(newStatus)
        setStatusHistory(prevStatusHistory => [
          ...prevStatusHistory,
          {
            username: user.name,
            newStatus: newStatus,
            timestamp: new Date().toLocaleString(),
          }
        ])
      } catch (error) {
        console.error('Error updating issue status:', error)
      }
    } else {
      console.error('Issue data not available')
    }
  }

  const updateIssue = async (projectId, issueId, issueToUpdate) => {
    try {
      const updatedIssue = await issueService.update(projectId, issueId, issueToUpdate)
      queryClient.setQueryData('issue', _ => updatedIssue)
    } catch (exception) {
      console.log(exception)
    }
  }

  const createComment = async (newComment) => {
    newComment.files = files.map(file => URL.createObjectURL(file))
    const comment = await commentService.create(projectId, issueId, newComment)
    setComments(comments.concat(comment))
    setFiles([])
  }


  const handleCommentInput = (event) => {
    setCommentInput(event.target.value)
  }

  const handleCommentFileUpload = (event) => {
    setCommentFiles(event.target.files)
  }

  const handleAddComment = () => {
    if (commentInput.trim() !== '') {
      const newComment = {
        text: commentInput,
        timestamp: new Date().toLocaleString(),
        files: commentFiles,
        user: user,
      }
      createComment(newComment)
      setComments(comments.concat(newComment))
      setCommentInput('')
      setCommentFiles([])
    }
  }

  const toggleEditComment = (commentId, text) => {
    setEditingCommentId(commentId)
    setEditedCommentText(text)
  }

  const saveEditedComment = (commentId) => {
    commentService.update(projectId, issueId, commentId, { text: editedCommentText })
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const editRecord = {
          editedBy: user.name,
          editedAt: new Date().toISOString(),
          oldText: comment.text,
          newText: editedCommentText,
        }
        // Check if 'edits' exists, if not, initialize it
        const edits = comment.edits ? [...comment.edits, editRecord] : [editRecord]
        return { ...comment, text: editedCommentText, edits }
      }
      return comment
    }))
    setEditingCommentId(null)
    setEditedCommentText("")
  }

  const toggleEditHistory = (commentId) => {
    setComments(prevComments => prevComments.map(comment => {
      if (comment.id === commentId) {
        // Toggle the showHistory property
        return { ...comment, showHistory: !comment.showHistory }
      }
      return comment
    }))
  }

  const updateDueDate = async (newDueDate) => {
    try {
      const oldDueDate = issue.dueDate
      await issueService.update(projectId, issueId, { dueDate: newDueDate })
      queryClient.setQueryData(['issue', issueId], prevIssue => ({ ...prevIssue, dueDate: newDueDate }))
      const editedDueDate = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        oldDueDate: oldDueDate,
        newDueDate: newDueDate,
      }
      setDueDateHistory([...dueDateHistory, editedDueDate])
    } catch (exception) {
      console.log(exception)
      throw new Error('Failed to update due date: ' + exception)
    }
  }

  const toggleDueDateEditMode = () => {
    setIsDueDateEditMode(!isDueDateEditMode)
    setDueDateInput(issue.dueDate)
  }

  const handleDueDateUpdate = async () => {
    try {
      const dueDate = Date(dueDateInput)
      const endOfDay = set(dueDate, { hours: 23, minutes: 59, seconds: 59 })
      await updateDueDate(endOfDay.toISOString())
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
    let day = date.getDate().toString()
    day = day.length > 1 ? day : '0' + day
    return day + '/' + month + '/' + year
  }

  const updateTitle = async (newTitle) => {
    try {
      // Update the issue title in the backend
      await issueService.update(projectId, issueId, { title: newTitle })
      // // Update the issue due date in the UI
      queryClient.setQueryData(['issue', issueId], prevIssue => ({ ...prevIssue, title: newTitle }))
      const editedTitle = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        title: newTitle,
      }
      setTitleHistory([...titleHistory, editedTitle])
    } catch (exception) {
      throw new Error('Failed to update title: ' + exception)
    }
  }

  const toggleTitleEditMode = () => {
    setIsTitleEditMode(!isTitleEditMode)
    // Set initial value of title input field to current title
    setTitleInput(issue.title)
  }

  const handleTitleUpdate = async () => {
    try {
      await updateTitle(titleInput)
      setIsTitleEditMode(false)
    } catch (error) {
      console.error('Error updating title:', error)
    }
  }

  const updateDescription = async (newDescription) => {
    try {
      await issueService.update(projectId, issueId, { description: newDescription })
      // Update the issue due date in the UI
      queryClient.setQueryData(['issue', issueId], prevIssue => ({ ...prevIssue, description: newDescription }))
    } catch (exception) {
      console.log(exception)
      throw new Error('Failed to update description: ' + exception)
    }
  }

  const toggleDescriptionEditMode = () => {
    setIsDescriptionEditMode(!isDescriptionEditMode)
    setDescriptionInput(issue.description)
  }

  const handleDescriptionUpdate = async () => {
    try {
      await updateDescription(descriptionInput)
      const editedDescription = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        description: descriptionInput
      }
      setDescriptionHistory([...descriptionHistory, editedDescription])
      setIsDescriptionEditMode(false)
    } catch (error) {
      console.error('Error updating description:', error)
    }
  }

  const toggleHistoryModal = (historyItem) => {
    setCurrentHistoryItem(historyItem)
    setShowHistoryModal(true)
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
    setCurrentHistoryItem(null)
  }

  const handleBackToProject = () => {
    navigate(`/project/${projectId}`)
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  // Render loading state or error message
  if (projectLoading || issueLoading || commentsLoading) return <div>Loading...</div>
  if (projectError) return <div>Error loading project: {projectErrorMessage.message}</div>
  if (issueError) return <div>Error loading issue: {issueErrorMessage.message}</div>
  if (commentsError) return <div>Error loading comments: {commentsErrorMessage.message}</div>

  return (
    <div className="issue-detail">
      <div className="issue-header">
        <div className="issue-title-container">
          {!isTitleEditMode ? (
            <h2 className="issue-title">{issue.title}</h2>
          ) : (
            <input
              type="text"
              className="title-edit-input"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
          )}
          {!isTitleEditMode ? (
            <button onClick={toggleTitleEditMode} className="edit-title-btn">Edit</button>
          ) : (
            <div className="button-group">
              <button onClick={handleTitleUpdate} className="save-title-btn">Save</button>
              <button onClick={() => setIsTitleEditMode(false)} className="cancel-edit-btn">Cancel</button>
            </div>
          )}
        </div>

        <div className="issue-information">
          <div className="status-and-info">
            {issue.creator.id === user.id ? (
              <button
                className={`status-btn ${currentStatus.toLowerCase()}`}
                onClick={handleStatusButtonClick}
              >
                <img src={currentStatus === 'Open' ? open_status : close_status} alt={currentStatus} />
                {currentStatus}
              </button>
            ) : (
              <span className="issue-status">Open</span>
            )}
            <p className="creator-info">
              {issue.creator.name} created this issue on {
                new Date(issue.createdDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}   ·   {comments.length} comments
            </p>
          </div>
        </div>
      </div>




      <div className="issue-body">
        <div className="left-section">

          <div className="description-box">
            <div className="header">
              <div className="left-header">
                <h3>Description</h3>
                {descriptionHistory && descriptionHistory.length > 0 && (
                  <>
                    <button onClick={() => setShowHistoryList(!showHistoryList)} className="history-btn">
                      last edited by {descriptionHistory[descriptionHistory.length - 1]?.username}
                      <img src={downArrow} alt="Show History" />
                    </button>
                    {showHistoryList && (
                      <ul>
                        {descriptionHistory.map((item, index) => (
                          <li key={index} onClick={() => toggleHistoryModal(item)}>
                            Edited by: {item.username} at {item.timestamp}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
              <button onClick={toggleDescriptionEditMode} className="edit-btn">
                <img src={edit_description_button} alt="Edit Description" />
              </button>
            </div>
            <hr />
            {!isDescriptionEditMode ? (
              <p className="description-text">{issue.description}</p>
            ) : (
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
              />
            )}
            {isDescriptionEditMode && (
              <div className="button-group">
                <button onClick={() => setIsDescriptionEditMode(false)} className="cancel-btn">Cancel</button>
                <button onClick={handleDescriptionUpdate} className="save-btn">Update Description</button>
              </div>
            )}
            {/* {showDescriptionHistory && renderDescriptionHistory()} */}
            {showHistoryModal && currentHistoryItem && (
              <div className="modal">
                <div className="modal-content">
                  <span className="close" onClick={closeHistoryModal}>&times;</span>
                  <p>
                    Edited by: {currentHistoryItem.username} at {currentHistoryItem.timestamp}
                  </p>
                  <p>
                    Description: {currentHistoryItem.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className='issue-details'>
            <h3> Detail Actions </h3>
            {/* Display notifications for description edits */}
            {descriptionHistory.map((entry, index) => (
              <div key={index}>
                {entry.username} edited the description on {entry.timestamp}
              </div>
            ))}

            {/* Display notifications for title edits */}
            {titleHistory.map((entry, index) => (
              <div key={index}>
                {entry.username} edited the title on {entry.timestamp}
              </div>
            ))}

            {/* Display notifications for assignee edits */}
            {assigneeHistory.map((entry, index) => (
              <div key={index}>
                {entry.username} {entry.assignee} on {entry.timestamp}
              </div>
            ))}

            {/*Display notifications for due date edits */}
            {dueDateHistory.map((entry, index) => (
              <div key={index}>
                {entry.username} changed the deadline of this issue from {new Date(entry.oldDueDate).toLocaleDateString('en-GB')} to {new Date(entry.newDueDate).toLocaleDateString('en-GB')} on {entry.timestamp}
              </div>
            ))}

            {/*Display notifications for issue status */}
            {statusHistory.map((entry, index) => (
              <div key={index}>
                {entry.username} {entry.newStatus === 'Open' ? 'opened' : 'closed'} this issue on {entry.timestamp}
              </div>
            ))}
          </div>

          <div className="issue-comments">
            <h3>Comments</h3>
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              comments.map((comment, index) => (
                <div className="comment" key={index}>
                  <p className="comment-user">{comment.user.name} commented on {formatTimestamp(comment.timestamp)}</p>
                  {
                    editingCommentId === comment.id ? (
                      <textarea
                        value={editedCommentText}
                        onChange={(e) => setEditedCommentText(e.target.value)}
                      />
                    ) : (
                      <p className="comment-text">{comment.text}</p>
                    )
                  }
                  {
                    user.id === comment.user.id && (
                      editingCommentId === comment.id ? (
                        <button onClick={() => saveEditedComment(comment.id)}>Save</button>
                      ) : (
                        <button onClick={() => toggleEditComment(comment.id, comment.text)}>Edit</button>
                      )
                    )
                  }
                  {/* Button to toggle edit history visibility */}
                  {comment.edits && comment.edits.length > 0 && (
                    <button onClick={() => toggleEditHistory(comment.id)}>Toggle Edit History</button>
                  )}
                  {/* Display edit history if available */}
                  {comment.showHistory && comment.edits && (
                    <ul>
                      {comment.edits.map((edit, idx) => (
                        <li key={idx}>
                          <strong>{edit.editedBy}</strong> edited on {formatTimestamp(edit.editedAt)}: from "{edit.oldText}" to "{edit.newText}"
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Display attached files with download links */}
                  {comment.files && comment.files.length > 0 && (
                    <div className="comment-files">
                      <strong>Attached Files:</strong>
                      <ul>
                        {Array.from(comment.files).map((file, fileIdx) => (
                          <li key={fileIdx}>
                            <a href={URL.createObjectURL(file)} download={file.name}>
                              {file.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
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
              onChange={handleCommentFileUpload}
            />
            <button className="comment-button" onClick={handleAddComment}>Comment</button>
          </div>
        </div>

        <div className="right-section">

          <div className="due-date">
            <div className="section-header">
              <h3>Due Date</h3>
              {user.id === issue.creator.id && (
                <button onClick={toggleDueDateEditMode} className="edit-btn">
                  <img src={edit_button} alt="Edit" />
                </button>
              )}
            </div>
            <p>Due on {formatDate(issue.dueDate)}</p>
            {isDueDateEditMode && (
              <div>
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={(e) => setDueDateInput(e.target.value)}
                />
                <button onClick={handleDueDateUpdate} className="save-btn">Save</button>
                <button onClick={() => setIsDueDateEditMode(false)} className="cancel-btn">Cancel</button>
              </div>
            )}
          </div>

          <div className="assignees">
            <div className="section-header">
              <h3>Assignees</h3>
              {issue.creator.id === user.id && (
                <button onClick={toggleAssigneeEditMode} className="edit-btn">
                  <img src={edit_button} alt="Edit" />
                </button>
              )}
            </div>
            <p>{issue.assignees.map(assignee => assignee.name).join(', ')}</p>
            {isAssigneeEditMode && (
              <div>
                <select
                  multiple
                  value={assigneeInput}
                  onChange={(e) => setAssigneeInput(Array.from(e.target.selectedOptions, option => option.value))}
                >
                  {project.members.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
                <button onClick={handleAssigneeUpdate} className="save-btn">Save</button>
                <button onClick={() => setIsAssigneeEditMode(false)} className="cancel-btn">Cancel</button>
              </div>
            )}
          </div>

          <div className="project-details">
            <div className="section-header">
              <h3>Project</h3>
              <button onClick={handleBackToProject} className="back-to-project-btn">
                <img src={back_project} alt="Back to Project" />
              </button>
            </div>
            <p>{project.name}</p>
          </div>

        </div>
      </div>

    </div >
  )
}

export default IssueDetail
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
  const [files, setFiles] = useState([])
  const [comments, setComments] = useState([])
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
  const [showDescriptionHistory, setShowDescriptionHistory] = useState(false)
  const [titleHistory, setTitleHistory] = useState([])
  const [assigneeHistory, setAssigneeHistory] = useState([])
  const [dueDateHistory, setDueDateHistory] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedCommentText, setEditedCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState([])



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
      const assigneeIds = newAssignees.map(assignee => assignee.id)
      await issueService.update(projectId, issueId, { assignees: assigneeIds })
      setIssue(prevIssue => ({ ...prevIssue, assignees: newAssignees }))
      const assigneeNames = newAssignees.map(assignee => assignee.name).join(', ');
      const assignedTo = assigneeNames ? `assigned to ${assigneeNames}` : 'unassigned';
      const editedAssignee = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        assignee: assignedTo,
      };
      setAssigneeHistory([...assigneeHistory, editedAssignee]);
    } catch (exception) {
      console.log(exception);
      throw new Error('Failed to update assignees: ' + exception)
    }
  }
  
  const handleAssigneeUpdate = async () => {
    try {
      const selectedAssigneeUsers = assigneeInput.map(assigneeName => project.members.find(user => user.name === assigneeName));
      await updateAssignee(selectedAssigneeUsers); 
      setIsAssigneeEditMode(false); 
    } catch (error) {
      console.error('Error updating assignees:', error)
    }
  }

  const handleStatusButtonClick = async () => {
    if (issue) {
      const newStatus = currentStatus === 'Open' ? 'Close' : 'Open';
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
      const newIssues = issues.map(
        issue => issue.id === id ? updatedIssue : issue
      )
      setIssues(newIssues)
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
      setComments(comments.concat(newComment));
      setCommentInput('')
      setCommentFiles([])
    }
  }

  const toggleEditComment = (commentId, text) => {
    setEditingCommentId(commentId)
    setEditedCommentText(text)
  }

  const saveEditedComment = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const editRecord = {
          editedBy: user.name,
          editedAt: new Date().toISOString(),
          oldText: comment.text,
          newText: editedCommentText,
        };
        // Check if 'edits' exists, if not, initialize it
        const edits = comment.edits ? [...comment.edits, editRecord] : [editRecord];
        return { ...comment, text: editedCommentText, edits };
      }
      return comment;
    }));
    setEditingCommentId(null);
    setEditedCommentText("");
  }

  const toggleEditHistory = (commentId) => {
    setComments(prevComments => prevComments.map(comment => {
      if (comment.id === commentId) {
        // Toggle the showHistory property
        return {...comment, showHistory: !comment.showHistory};
      }
      return comment;
    }));
  }

  const updateDueDate = async (newDueDate) => {
    try {
      const oldDueDate = issue.dueDate
      await issueService.update(projectId, issueId, { dueDate: newDueDate })
      setIssue(prevIssue => ({ ...prevIssue, dueDate: newDueDate }))
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
      await updateDueDate(new Date(dueDateInput))
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

  const updateTitle = async (newTitle) => {
    try {
      // Update the issue title in the backend
      await issueService.update(projectId, issueId, { title: newTitle })
      // // Update the issue due date in the UI
      setIssue(prevIssue => ({ ...prevIssue, title: newTitle }))
      const editedTitle = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        title: newTitle,
      };
      setTitleHistory([...titleHistory, editedTitle]);
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
      // Update the issue title in the backend
      await issueService.update(projectId, issueId, { description: newDescription })
      // Update the issue due date in the UI
      setIssue(prevIssue => ({ ...prevIssue, description: newDescription }))
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
      await updateDescription(descriptionInput);
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

  const toggleDescriptionHistory = () => {
    setShowDescriptionHistory(!showDescriptionHistory)
  }

  const renderDescriptionHistory = () => {
    return (
      <div>
        <h4>Description History</h4>
        <button onClick={toggleDescriptionHistory}>
          {showDescriptionHistory ? 'Hide' : 'Show'} History
        </button>
        {showDescriptionHistory && (
          <ul>
            {descriptionHistory.map((entry, index) => (
              <li key={index}>
                {entry.username} edited at {entry.timestamp}: {entry.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${hours}:${minutes} ${day}/${month}/${year}`
  }

  return (
    <div className="issue-detail">
      {issue && <div>
        <div className="issue-header">
          
          <h2 className="issue-header">
            {!isTitleEditMode ? (
              issue.title
            ) : (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
              />
            )}
          </h2>
          {/* Render edit button for the title */}
          {!isTitleEditMode &&(
            <button onClick={toggleTitleEditMode}>Edit Title</button>
          )}
          
          {/* Render update button if in edit mode */}
          {isTitleEditMode && (
            <button onClick={handleTitleUpdate}>Update Title</button>
          )}


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
            <h3> Description {' '}

            {!isDescriptionEditMode && (
              <div>
                  <button onClick={toggleDescriptionEditMode}> Edit</button>
                  {renderDescriptionHistory}
              </div>
            )}
            </h3>

            {!isDescriptionEditMode ? (
              <p className="issue-description-text">{issue.description}</p>
            ) : (
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
              />
            )}
            {isDescriptionEditMode && (
              <div>
                <button onClick={handleDescriptionUpdate}> Update </button>
                {renderDescriptionHistory()}
              </div>
            )}
          </div>

          <div className="issue-details">
            <h3>Assignees</h3>

            {issue.creator.id != user.id && <div className="assignee">
              <p> {issue.assignees.map(assignee => assignee.name).join(', ')} </p>
              </div>}

            {issue.creator.id === user.id && (
            <div className="assignee">
              <p>{issue.assignees.map(assignee => assignee.name).join(', ')}</p>
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

          <div className="issue-details">
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
          </div>
          <button className="comment-button" onClick={handleAddComment}>Comment</button>
        </div>
      </div>}
    </div>
  )
}

export default IssueDetail
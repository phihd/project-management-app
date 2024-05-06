/* eslint-disable */

import React, { useState, useContext, useRef } from 'react'
import './IssueDetail.css'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import issueService from '../services/issues'
import projectService from '../services/projects'
import commentService from '../services/comments'
import userService from '../services/users'
import UserContext from './UserContext'
import { useNavigate } from 'react-router-dom'
import { set } from 'date-fns'
import NProgress from 'nprogress'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

import back_project from '../img/left.png'
import open_status from '../img/open_issue.png'
import close_status from '../img/close_issue.png'
import edit_button from '../img/edit_button.png'
import edit_description_button from '../img/edit_description.png'
import downArrow from '../img/down-arrow.png'
import number_list from '../img/number_list.png'
import bullet_list from '../img/bullet_list.png'
import task_list from '../img/task_list.png'
import edit_due from '../img/edit_due.png'
import edit_assignee from '../img/edit_assignee.png'
import edit_title from '../img/edit_title.png'
import edit_close from '../img/edit_close.png'
import edit_open from '../img/status_button.png'
import default_user from '../img/default_avatar.png'


const IssueDetail = () => {

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
  const [actionHistory, setActionHistory] = useState([])
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editedCommentText, setEditedCommentText] = useState("")
  const [commentFiles, setCommentFiles] = useState([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [currentHistoryItem, setCurrentHistoryItem] = useState(null)
  const [showHistoryList, setShowHistoryList] = useState(false)
  const [showCommentOptions, setShowCommentOptions] = useState(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const historyRef = useRef(null)
  const [currentTab, setCurrentTab] = useState('Edit')
  const textAreaRef = useRef(null)
  const [description, setDescription] = useState('')
  const usernameRegex = /^(.*?) (assigned|reopened|closed|changed the due date from|updated title to)/
  const commentOptionsRef = useRef(null)
  const [showCommentHistoryIndex, setShowCommentHistoryIndex] = useState(null)

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
    onSuccess: async (data) => {
      setCurrentStatus(data.status)
      setActionHistory(data.actionHistory)
      const versionsWithUsernames = await Promise.all(data.description.versions.map(async (version) => {
        const userDetail = await userService.get(version.user)
        return {
          ...version,
          username: userDetail.username || 'Unknown User',
          name: userDetail.name || 'Unknown User'
        }
      }))
      setDescriptionHistory(versionsWithUsernames)
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

  const handleAssigneeUpdate = async () => {
    if (assigneeInput.sort().toString() !== issue.assignees.map(a => a.id).sort().toString()) {
      try {
        const selectedAssigneeUsers = assigneeInput.map(assigneeName => project.members.find(user => user.name === assigneeName))
        const actionDescription = `${user.name} assigned ${assigneeInput.join(', ')}`
        await updateIssue({ assignees: selectedAssigneeUsers.map(user => user.id) }, actionDescription)
        setIsAssigneeEditMode(false)
      } catch (error) {
        console.error('Error updating assignees:', error)
      }
    }
  }

  const handleStatusButtonClick = async () => {
    if (issue) {
      const newStatus = currentStatus === 'Open' ? 'Close' : 'Open'
      try {
        const actionDescription = `${user.name} ${newStatus === 'Open' ? 'reopened' : 'closed'} this issue`
        await updateIssue({ status: newStatus }, actionDescription)
        setCurrentStatus(newStatus)
      } catch (error) {
        console.error('Error updating issue status:', error)
      }
    } else {
      console.error('Issue data not available')
    }
  }

  const handleDueDateUpdate = async () => {
    if (new Date(dueDateInput).getTime() !== new Date(issue.dueDate).getTime()) {
      try {
        const actionDescription = `${user.name} changed the due date from ${formatDate(issue.dueDate)} to ${formatDate(dueDateInput)}`
        const dueDate = new Date(dueDateInput)
        const endOfDay = set(dueDate, { hours: 23, minutes: 59, seconds: 59 })
        await updateIssue({ dueDate: endOfDay.toISOString() }, actionDescription)
        setIsDueDateEditMode(false)
      } catch (error) {
        console.error('Error updating due date:', error)
      }
    }
  }

  const handleDescriptionUpdate = async () => {
    if (descriptionInput !== issue.description.text) {
      try {
        const editedDescription = {
          username: user.name,
          timestamp: new Date().toLocaleString(),
          text: issue.description.text
        }
        await updateIssue({
          description: {
            text: descriptionInput
          }
        })
        setDescriptionHistory([...descriptionHistory, editedDescription])
        setIsDescriptionEditMode(false)
      } catch (error) {
        console.error('Error updating description:', error)
      }
    }
  }

  const updateIssue = async (issueToUpdate, actionDescription = null) => {
    try {
      if (actionDescription) {
        const actionEntry = {
          description: actionDescription,
          timestamp: new Date(),
          user: user.id
        }

        issueToUpdate.actionHistory = [...(actionHistory || []), actionEntry]
      }
      NProgress.start()

      const updatedIssue = await issueService.update(projectId, issueId, issueToUpdate)

      NProgress.done()

      queryClient.setQueryData(['issue', issueId], updatedIssue)

      return updatedIssue
    } catch (exception) {
      console.error('Failed to update the issue:', exception)
      throw new Error('Failed to update the issue.')
    }
  }

  const handleCommentInput = (event) => {
    setCommentInput(event.target.value)
  }

  const handleCommentFileUpload = (event) => {
    setCommentFiles(event.target.files)
  }

  const createComment = async (formData) => {
    try {
      const comment = await commentService.create(projectId, issueId, formData)
      queryClient.setQueryData(['comments', issueId], oldComments => [...oldComments, comment])
      setFiles([])
    } catch (error) {
      console.error('Failed to create comment:', error)
    }
  }

  const handleAddComment = () => {
    if (commentInput.trim() !== '') {
      const formData = new FormData()
      formData.append('text', commentInput)
      formData.append('timestamp', new Date().toLocaleString())
      formData.append('user', user)

      // Append files if there are any
      for (const file of commentFiles) {
        formData.append('files', file)
      }

      createComment(formData)
      setCommentInput('')
      setCommentFiles([])
    }
  }

  const toggleEditComment = (commentId, text) => {
    setEditingCommentId(commentId)
    setEditedCommentText(text)
  }

  const saveEditedComment = (comment) => {
    if (comment.text !== editedCommentText) {
      commentService.update(projectId, issueId, comment.id, { text: editedCommentText })
      queryClient.setQueryData(['comments', issueId], comments.map(old_comment => {
        if (old_comment.id === comment.id) {
          return { ...old_comment, text: editedCommentText }
        }
      }))
    }
    setEditingCommentId(null)
    setEditedCommentText("")
  }

  const toggleEditHistory = (commentId) => {
    queryClient.setQueryData(['comments', issueId], prevComments => prevComments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, showHistory: !comment.showHistory }
      }
      if (showCommentHistoryIndex === index) {
        setShowCommentHistoryIndex(null) // Close the current open history list
      } else {
        setShowCommentHistoryIndex(index) // Open the clicked history list
      }
      return comment
    }))
  }

  const toggleDueDateEditMode = () => {
    setIsDueDateEditMode(!isDueDateEditMode)
    setDueDateInput(issue.dueDate)
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

  const toggleTitleEditMode = () => {
    setIsTitleEditMode(!isTitleEditMode)
    // Set initial value of title input field to current title
    setTitleInput(issue.title)
  }

  const handleTitleUpdate = async () => {
    if (titleInput !== issue.title) {
      try {
        const actionDescription = `${user.name} updated title to "${titleInput}"`
        setIsTitleEditMode(false)
        await updateIssue({ title: titleInput }, actionDescription)
      } catch (error) {
        console.error('Error updating title:', error)
      }
    }
  }

  const toggleDescriptionEditMode = () => {
    setIsDescriptionEditMode(prev => {
      // Toggle the state and set up a callback to focus after the update
      if (!prev) { // If we are about to enter edit mode
        setTimeout(() => {
          // Check if the textarea is rendered and visible:
          const textarea = textAreaRef.current
          if (textarea) {
            textarea.focus()
            // Set the cursor at the end of the text
            const length = textarea.value.length
            textarea.setSelectionRange(length, length)
          }
        }, 0)
      }
      return !prev
    })
    setDescriptionInput(issue.description.text)
  }

  const toggleHistoryModal = (historyItem) => {
    setCurrentHistoryItem(historyItem)
    setShowHistoryModal(true)
  }

  const closeHistoryModal = () => {
    setShowHistoryModal(false)
    setCurrentHistoryItem(null)
  }

  const toggleHistoryList = () => {
    setShowHistoryList(!showHistoryList)
    // If the list is not currently shown, add the click listener
    if (!showHistoryList) {
      setTimeout(() => { // Use setTimeout to delay the addition of the event listener
        document.addEventListener('mousedown', handleClickOutside, true)
      }, 0)
    }
  }

  const handleClickOutside = event => {
    if (historyRef.current && !historyRef.current.contains(event.target)) {
      setShowHistoryList(false)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
    if (commentOptionsRef.current && !commentOptionsRef.current.contains(event.target)) {
      setShowCommentOptions(null)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
    if (historyRef.current && !historyRef.current.contains(event.target)) {
      setShowCommentHistoryIndex(false)
      document.removeEventListener('mousedown', handleClickOutside, true)
    }
  }

  const handleBackToProject = () => {
    navigate(`/project/${projectId}`)
  }

  const renderDescription = (description, setDescription) => {
    const handleCheckboxChange = async (index) => {
      const lines = description.split('\n')
      const newLines = [...lines]
      const line = lines[index]

      if (line.startsWith("- [  ] ")) {
        newLines[index] = "- [x] " + line.substring(6)
      } else if (line.startsWith("- [x] ")) {
        newLines[index] = "- [  ] " + line.substring(6)
      }

      const newDescription = newLines.join('\n')
      setDescription(newDescription)
      await updateIssue({
        description: {
          text: newDescription
        }
      })

      const editedDescription = {
        username: user.name,
        timestamp: new Date().toLocaleString(),
        description: newDescription
      }
      setDescriptionHistory([...descriptionHistory, editedDescription])
    }

    return (
      <div className='description-text'>
        {description.split('\n').map((line, index) => {
          if (line.startsWith("- [  ] ")) {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" onChange={() => handleCheckboxChange(index)} />
                <span>{line.substring(6)}</span>
              </div>
            )
          } else if (line.startsWith("- [x] ")) {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked onChange={() => handleCheckboxChange(index)} />
                <span>{line.substring(6)}</span>
              </div>
            )
          }
          return <p key={index}>{line}</p>
        })}
      </div>
    )
  }

  const renderDescriptionWithCheckboxes = (description) => {
    return description.split('\n').map((line, index) => {
      if (line.startsWith("- [  ] ")) {
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" disabled /> <span>{line.substring(6)}</span>
          </div>
        )
      } else if (line.startsWith("- [x] ")) {
        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" checked disabled />
            <span>{line.substring(6)}</span>
          </div>
        )
      }
      return <p key={index}>{line}</p>
    })
  }

  const insertNumberList = () => {
    const textarea = textAreaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Split the text into before and after the current cursor position
    const textBefore = descriptionInput.substring(0, start)
    const textAfter = descriptionInput.substring(end)

    // Find if the current line has some content
    const lastNewLine = textBefore.lastIndexOf('\n')
    const currentLineContent = textBefore.substring(lastNewLine + 1)
    const newTextBefore = textBefore.substring(0, lastNewLine + 1)

    // Check if current line has content, and prepend "1. "
    if (currentLineContent.trim().length === 0) {
      // If no content in the current line
      setDescriptionInput(textBefore + "1. " + textAfter)
    } else {
      // If there's content, prepend "1. " to the current line
      setDescriptionInput(newTextBefore + "1. " + currentLineContent + textAfter)
    }

    setTimeout(() => {
      // Place cursor right after the newly inserted "1. "
      const newCursorPosition = newTextBefore.length + 3 // +3 for "1. "
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition
      textarea.focus()
    }, 0)
  }

  const insertBulletList = () => {
    const textarea = textAreaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Split the text into before and after the current cursor position
    const textBefore = descriptionInput.substring(0, start)
    const textAfter = descriptionInput.substring(end)

    // Find if the current line has some content
    const lastNewLine = textBefore.lastIndexOf('\n')
    const currentLineContent = textBefore.substring(lastNewLine + 1)
    const newTextBefore = textBefore.substring(0, lastNewLine + 1)

    // Check if current line has content, and prepend "-" to the current line
    if (currentLineContent.trim().length === 0) {
      // If no content in the current line
      setDescriptionInput(textBefore + "● " + textAfter)
    } else {
      // If there's content, prepend "- " to the current line
      setDescriptionInput(newTextBefore + "- " + currentLineContent + textAfter)
    }

    setTimeout(() => {
      // Place cursor right after the newly inserted "- "
      const newCursorPosition = newTextBefore.length + 2 // +2 for "- "
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition
      textarea.focus()
    }, 0)
  }

  const insertTaskList = () => {
    const textarea = textAreaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const textBefore = descriptionInput.substring(0, start)
    const textAfter = descriptionInput.substring(end)

    const lastNewLine = textBefore.lastIndexOf('\n')
    const currentLineContent = textBefore.substring(lastNewLine + 1)
    const newTextBefore = textBefore.substring(0, lastNewLine + 1)

    // Check if current line has content, and prepend "- [ ] " to the current line
    if (currentLineContent.trim().length === 0) {
      setDescriptionInput(textBefore + "- [  ] " + textAfter)
    } else {
      setDescriptionInput(newTextBefore + "- [  ] " + currentLineContent + textAfter)
    }

    setTimeout(() => {
      // Place cursor right after the newly inserted "- [ ] "
      const newCursorPosition = newTextBefore.length + 6 // +6 for "- [ ] "
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition
      textarea.focus()
    }, 0)
  }



  const handleKeyDown = (e) => {
    const textarea = textAreaRef.current
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent the default action to manage new line ourselves

      // Get current cursor position:
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const textBefore = descriptionInput.substring(0, start)
      const textAfter = descriptionInput.substring(end)

      // Find the type of list and act accordingly
      const linesBeforeCursor = textBefore.split('\n')
      const lastLine = linesBeforeCursor[linesBeforeCursor.length - 1]
      const numberMatch = lastLine.match(/^(\d+)\./)
      const bulletMatch = lastLine.startsWith("● ")
      const taskMatch = lastLine.trim().startsWith("- [  ]") || lastLine.trim().startsWith("- [x] ")

      let newText = textBefore + '\n'

      if (numberMatch) {
        const number = parseInt(numberMatch[1], 10)
        newText += (number + 1) + '. ' + textAfter
      } else if (bulletMatch) {
        newText += "● " + textAfter
      } else if (taskMatch) {
        newText += "- [  ] " + textAfter
      } else {
        newText += textAfter // No list, continue with normal text
      }

      setDescriptionInput(newText)
      setTimeout(() => {
        // Place cursor after the newly inserted prefix
        const positionAdjust = numberMatch ? (numberMatch[1].length + 3) : bulletMatch ? 3 : taskMatch ? 8 : 1
        const position = start + positionAdjust // Adjust for ". ", "- ", or "- [ ] "
        textarea.selectionStart = textarea.selectionEnd = position
        textarea.focus()
      }, 0)
    }
  }

  function getButtonImage(description) {
    if (description.toLowerCase().includes('changed the due date')) return edit_due
    if (description.toLowerCase().includes('assigned')) return edit_assignee
    if (description.toLowerCase().includes('updated title')) return edit_title
    if (description.toLowerCase().includes('closed this issue')) return edit_close
    if (description.toLowerCase().includes('reopened this issue')) return edit_open
    return null // Default case if no conditions are met
  }

  const toggleCommentOptions = (index) => {
    if (showCommentOptions === index) {
      // If clicking on the currently open dropdown, close it and remove the listener
      setShowCommentOptions(null)
      document.removeEventListener('mousedown', handleClickOutside, true)
    } else {
      // Open the dropdown and add the listener
      setShowCommentOptions(index)
      setTimeout(() => { // Use setTimeout to delay the addition of the event listener
        document.addEventListener('mousedown', handleClickOutside, true)
      }, 0)
    }
  }

  const deleteComment = async (commentId) => {
    commentService.remove(projectId, issueId, commentId)
    queryClient.setQueryData(['comments', issueId], prevComments => prevComments.filter(comment => comment.id !== commentId))
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
  if (projectLoading || issueLoading || commentsLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
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
              <span
                className={`issue-status ${currentStatus.toLowerCase()}`}
              >
                {currentStatus}
              </span>
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
        <div className='left-container'>
          <div className="left-section">
            <div className="description-box">
              <div className="header">
                <div className="left-header">
                  <h3>Description</h3>
                  {descriptionHistory && descriptionHistory.length > 0 && (
                    <>
                      <button onClick={toggleHistoryList} className="history-btn">
                        last edited by {descriptionHistory[descriptionHistory.length - 1]?.name}
                        <img src={downArrow} alt="Show History" />
                      </button>
                      {showHistoryList && (
                        <ul className='history-list' ref={historyRef}>
                          {descriptionHistory.slice().reverse().map((item, index) => (
                            <li key={index} onClick={() => toggleHistoryModal(item)}>
                              {item.name} edited at {formatDate(item.timestamp)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>

                {issue.assignees.find(assignee => assignee.id === user.id) ?
                  <div>
                    <button onClick={toggleDescriptionEditMode} className="edit-btn">
                      <img src={edit_description_button} alt="Edit Description" />
                    </button>
                  </div> :
                  <div></div>
                }
              </div>
              <hr />
              {!isDescriptionEditMode ? (
                renderDescription(issue.description.text, setDescription)
              ) : (
                <>
                  <div className="edit-container">
                    <div className="tabs-and-toolbar">
                      <div className="tabs">
                        <button onClick={() => setCurrentTab('Edit')} className={currentTab === 'Edit' ? 'active' : ''}>
                          Edit
                        </button>
                        <button onClick={() => setCurrentTab('Preview')} className={currentTab === 'Preview' ? 'active' : ''}>
                          Preview
                        </button>
                      </div>
                      {currentTab === 'Edit' && (
                        <div className="toolbar">
                          <button onClick={insertNumberList} title="Number List">
                            <img src={number_list} alt="Number List" />
                          </button>
                          <button onClick={insertBulletList} title="Bullet List">
                            <img src={bullet_list} alt="Bullet List" />
                          </button>
                          <button onClick={insertTaskList} title="Task List">
                            <img src={task_list} alt="Task List" />
                          </button>
                        </div>
                      )}
                    </div>

                    {currentTab === 'Edit' && (
                      <textarea
                        ref={textAreaRef}
                        value={descriptionInput}
                        onChange={(e) => setDescriptionInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-input"
                      />
                    )}

                    {currentTab === 'Preview' && (
                      <div className="preview">
                        {renderDescriptionWithCheckboxes(descriptionInput, true)}
                      </div>
                    )}
                  </div>


                </>
              )}
              {isDescriptionEditMode && (
                <div className="button-group">
                  <button onClick={() => setIsDescriptionEditMode(false)} className="cancel-btn">Cancel</button>
                  <button onClick={handleDescriptionUpdate} className="save-btn">Update Description</button>
                </div>
              )}

              {showHistoryModal && currentHistoryItem && (
                <div className="modal" onClick={closeHistoryModal}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <span>{currentHistoryItem.name} edited at {formatDate(currentHistoryItem.timestamp)}</span>
                      <span className="close" onClick={closeHistoryModal}>x</span>
                    </div>
                    <hr />
                    <div className="modal-body">
                      {renderDescriptionWithCheckboxes(currentHistoryItem.text)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="detail-actions-container">
              {/* <h3>Detail Actions</h3> */}
              {actionHistory.map((entry, index) => (
                <div key={index} style={{ top: `${index * 60}px` }} className="action-item">
                  <button className="action-button" style={{ backgroundImage: `url(${getButtonImage(entry.description)})` }}></button>
                  <p className="action-text">
                    {entry.description.match(usernameRegex) ? (
                      <>
                        <span className="username-style">{entry.description.match(usernameRegex)[1]}</span>
                        {entry.description.substring(entry.description.match(usernameRegex)[1].length)} on {formatTimestamp(new Date(entry.timestamp))}
                      </>
                    ) : (
                      <span>{entry.description} on {formatDate(entry.timestamp)}</span>
                    )}
                  </p>
                </div>
              ))}
            </div>


            <div className="issue-comments">
              {comments.length === 0 ? (
                <p></p>
              ) : (
                comments.map((comment, index) => (
                  <div className="comment-box" key={index}>
                    <div className="comment-header">
                      <img src={default_user} alt={comment.user.name} className="comment-avatar" />
                      <div className="comment-info">
                        <p className="comment-user">{comment.user.name} commented on {formatDate(comment.timestamp)}
                          {comment.versions && comment.versions.length > 1 && (
                            <>
                              <button className="edited" onClick={() => toggleEditHistory(comment.id)}>
                                · edited <img src={downArrow} alt="Toggle History" />
                              </button>
                              {comment.showHistory && (
                                <ul className="comment-history-list">
                                  {comment.versions.map((version, idx) => (
                                    <li key={idx} onClick={() => toggleHistoryModal(version)}>
                                      {comment.user.name} edited on {formatTimestamp(version.timestamp)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          )}
                        </p>
                      </div>
                      <div className="comment-actions">
                        <button onClick={() => toggleCommentOptions(index)} className="comment-toggle"> Options
                          <img src={downArrow} alt="Show History" />
                        </button>
                        {showCommentOptions === index && (
                          <div className="comment-options" ref={commentOptionsRef}>
                            <button onClick={() => toggleEditComment(comment.id, comment.text)}>Edit</button>
                            <button onClick={() => deleteComment(comment.id)}>Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="comment-content">
                      {editingCommentId === comment.id ? (
                        <textarea
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                        />
                      ) : (
                        <p className="comment-text">
                          {comment.text}
                          <br></br>
                          {comment.files && comment.files.map((file, index) => (
                            <a key={index} href={`/${file}`} target="_blank" rel="noopener noreferrer">View Attachment</a>
                          ))}
                        </p>
                      )}

                      {editingCommentId === comment.id && (
                        <div className='button-group'>
                          <button onClick={() => saveEditedComment(comment)} className='save-btn'>Save</button>
                          <button onClick={() => toggleEditComment(null)} className="cancel-btn">Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>


          <div className='under-left-section'>
            <div className="add-comment">
              {/* <h3>add a comment</h3> */}
              {issue.assignees.find(assignee => assignee.id === user.id) ?
                <div>
                  <textarea
                    className="comment-input"
                    placeholder="Leave a comment"
                    value={commentInput}
                    onChange={handleCommentInput}
                  ></textarea>
                  <div className="comment-actions">
                    <input
                      type="file"
                      multiple
                      onChange={handleCommentFileUpload}
                      className="file-input"
                    />
                    <button className="comment-button" onClick={handleAddComment}>Comment</button>
                  </div>
                </div> :
                <div></div>
              }
            </div>
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
    </div>
  )
}

export default IssueDetail
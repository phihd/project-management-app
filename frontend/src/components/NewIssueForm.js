import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useQuery } from 'react-query'
import userService from '../services/users'
import { set } from 'date-fns'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })
import './NewIssueForm.css'

function NewIssueForm({ handleCreateIssue, handleCloseForm }) {
  const [issueTitle, setIssueTitle] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date()
    // Default: Add one month to today's date
    const oneMonthLater = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
    return oneMonthLater
  })
  const [selectedAssignees, setSelectedAssignees] = useState([])

  const { data: assignees, isLoading, isError, error } = useQuery('assignees', userService.getAll)

  function formatDate(date) {
    const endOfDay = set(date, { hours: 23, minutes: 59, seconds: 59 })
    return endOfDay.toISOString()
  }


  const handleAssigneeSelection = (assigneeId) => {
    let newSelectedAssignees = [...selectedAssignees]

    if (newSelectedAssignees.includes(assigneeId)) {
      newSelectedAssignees = newSelectedAssignees.filter(id => id !== assigneeId)
    } else {
      newSelectedAssignees.push(assigneeId)
    }

    setSelectedAssignees(newSelectedAssignees)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newIssue = {
      title: issueTitle,
      description: { text: issueDescription },
      dueDate: dueDate ? formatDate(dueDate) : '',
      assignees: selectedAssignees
    }
    handleCreateIssue(newIssue)
    handleCloseForm()
  }

  if (isLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
  if (isError) return <div>Error loading assignees: {error.message}</div>

  return (
    <form onSubmit={handleSubmit} className='new-issue-form'>
      <h2>Create New Issue</h2>
      <div>
        <label>Title:</label>
        <input
          type="text"
          value={issueTitle}
          onChange={(e) => setIssueTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
        ></textarea>
      </div>
      <div>
        <label>Due Date:</label>
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          dateFormat="dd-MM-yyyy"
          placeholderText="Select due date"
        />
      </div>
      <div>
        <label>Select Assignees:</label>
        <div className="assignees-list">
          {assignees.map(assignee => (
            <div
              key={assignee.id}
              className={`assignee-item ${selectedAssignees.includes(assignee.id) ? 'selected' : ''}`}
              onClick={() => handleAssigneeSelection(assignee.id)}
            >
              {assignee.name}
            </div>
          ))}
        </div>
      </div>
      <div>
        <button type="submit">Create Issue</button>
        <button type="button" onClick={handleCloseForm}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default NewIssueForm

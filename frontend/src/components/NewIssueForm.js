import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import userService from '../services/users'

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
  const [assignees, setAssignees] = useState([])

  useEffect(() => {
    // Fetch the list of users/assignees from the server
    userService.getAll().then(users => {
      setAssignees(users)
    })
  }, [])

  const handleAssigneeSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedAssignees(selectedOptions)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newIssue = {
      title: issueTitle,
      description: issueDescription,
      dueDate: dueDate ? dueDate.toISOString().split('T')[0] : '', // Format date before sending
      assignees: selectedAssignees
    }
    handleCreateIssue(newIssue)
    handleCloseForm()
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <select
          id="assignees"
          multiple
          onChange={handleAssigneeSelection}
        >
          {assignees.map(assignee => (
            <option key={assignee.id} value={assignee.id}>
              {assignee.name}
            </option>
          ))}
        </select>
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

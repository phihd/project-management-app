import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useQuery } from 'react-query'
import userService from '../services/users'
import { set } from 'date-fns'

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


  const handleAssigneeSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedAssignees(selectedOptions)
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

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading assignees: {error.message}</div>

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

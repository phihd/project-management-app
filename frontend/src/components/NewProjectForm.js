import React, { useState, useQuery } from 'react'
import userService from '../services/users'
import './NewProjectForm.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

const NewProjectForm = ({ handleCreateProject, handleCloseForm }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])

  const { data: members, isLoading, isError, error } = useQuery('members', userService.getAll)

  const handleMemberSelection = (e) => {
    const selectedMemberIds = Array.from(e.target.selectedOptions, option => option.value)
    setSelectedMembers(selectedMemberIds)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const newProject = {
      name,
      description,
      members: selectedMembers,
    }
    handleCreateProject(newProject)
    handleCloseForm()
  }

  if (isLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
  if (isError) return <div>Error loading project members: {error.message}</div>

  return (
    <div className="new-form-container">
      <h2>Create New Project</h2>
      <form onSubmit={handleFormSubmit} className='project-form'>
        <div>
          <label htmlFor="name">Project Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            className="new-form-input"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            className="new-form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="members">Select Members:</label>
          <select
            id="members"
            className="new-form-select"
            multiple
            onChange={handleMemberSelection}
          >
            {members.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
        <div className="button-group">
          <button type="submit" className="new-form-button">Create Project</button>
          <button type="button" className="new-form-button-cancel" onClick={handleCloseForm}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default NewProjectForm

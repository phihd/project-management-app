import React, { useState, useEffect } from 'react'
import userService from '../services/users'
import './NewProjectForm.css'

const NewProjectForm = ({ handleCreateProject, handleCloseForm }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])

  useEffect(() => {
    userService.getAll().then(users => {
      setMembers(users)
    })
  }, [])

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

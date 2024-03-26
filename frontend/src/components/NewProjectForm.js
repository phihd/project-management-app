import React, { useState, useEffect } from 'react'
import userService from '../services/users'

const NewProjectForm = ({ handleCreateProject, handleCloseForm }) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [members, setMembers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])

  useEffect(() => {
    // Fetch the list of users/members from the server
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
    <form onSubmit={handleFormSubmit}>
      <div>
        <label htmlFor="name">Project Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="members">Select Members:</label>
        <select
          id="members"
          multiple
          onChange={handleMemberSelection}
        >
          {members.map(member => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">Create Project</button>
    </form>
  )
}

export default NewProjectForm
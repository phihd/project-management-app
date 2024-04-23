/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NewProjectForm from './NewProjectForm'
import projectService from '../services/projects'

import delete_button from '../img/delete.png'


function Table({ projects }) {
  const navigate = useNavigate()

  const handleStatusChange = (projectId, newStatus, event) => {
    event.stopPropagation()
    projectId
    newStatus
  }

  const handleRowClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  const handleDeleteProject = async (projectId, event) => {
    event.stopPropagation()
    const confirmDelete = window.confirm('Are you sure you want to delete this project?')

    if (confirmDelete) {
      await projectService.remove(projectId)
      // Filter out the deleted project and update the projects list
      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))
    }
  }

  return (
    <section className="table">
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Status</th>
            <th>Department</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} onClick={() => handleRowClick(project.id)}>
              <td>{project.name}</td>
              <td>
                <div className="status-buttons">
                  <button
                    onClick={(e) => handleStatusChange(project.id, project.status.activityStatus, e)}
                    className={`status-button ${project.status.activityStatus.toLowerCase()}`}
                  >
                    {project.status.activityStatus}
                  </button>
                  <button
                    onClick={(e) => handleStatusChange(project.id, project.status.progressStatus, e)}
                    className={`status-button ${project.status.progressStatus.toLowerCase().replace(/\s/g, '')}`}
                  >
                    {project.status.progressStatus}
                  </button>
                  <button
                    onClick={(e) => handleStatusChange(project.id, project.status.completionStatus, e)}
                    className={`status-button ${project.status.completionStatus.toLowerCase()}`}
                  >
                    {project.status.completionStatus}
                  </button>
                </div>
              </td>
              <td>{project.department}</td>
              <td>
                {project.members.map((member) => (
                  <span key={member.id}>
                    {member.name}
                    {member !== project.members[project.members.length - 1] && ', '}
                  </span>
                ))}
              </td>
              <td>
                <button className="delete-button" onClick={(e) => handleDeleteProject(project.id, e)}>
                  <img className="delete-button-img" src={delete_button} alt="Delete" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

const Project = () => {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projects, setProjects] = useState([])
  const [refreshProjects, setRefreshProjects] = useState(false)


  useEffect(() => {
    projectService.getAll().then(projects => {
      setProjects(projects)
    }
    )
  }, [refreshProjects])

  const handleNewProjectClick = () => {
    setShowProjectForm(true)
  }

  const handleCloseForm = () => {
    setShowProjectForm(false)
  }

  const handleCreateProject = async (newProject) => {
    if (newProject.name !== '') {
      const project = await projectService.create(newProject)
      setProjects(prev => [...prev, project])
      setRefreshProjects(prev => !prev)
    }
  }

  return (
    <div>
      <div className="new-project-button">
        <button onClick={handleNewProjectClick}>Create New Project</button>
      </div>
      {showProjectForm && (
        <div className="overlay">
          <div className="modal">
            <button onClick={handleCloseForm}>Close</button>
            <NewProjectForm handleCloseForm={handleCloseForm} handleCreateProject={handleCreateProject} />
          </div>
        </div>
      )}
      <Table projects={projects} />
    </div>
  )
}

export default Project

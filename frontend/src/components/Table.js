import React from 'react'
import { useNavigate } from 'react-router-dom'
import projectService from '../services/projects'
import delete_button from '../img/delete.png'
import NewProjectForm from './NewProjectForm'
import add_img from '../img/addnew.png'

const Table = ({ projects, queryClient, handleNewProjectClick, showProjectForm, handleCloseForm, handleCreateProject }) => {
  const navigate = useNavigate()

  const handleRowClick = (projectId) => {
    navigate(`/project/${projectId}`)
  }

  const handleDeleteProject = async (projectId, event) => {
    event.stopPropagation()
    if (window.confirm('Are you sure you want to delete this project?')) {
      await projectService.remove(projectId)
      queryClient.setQueryData('projects', old => old.filter(project => project.id !== projectId))
    }
  }

  return (
    <div className="project-page">
      <div className="project-header">
        <h2>Project Dashboard</h2>
        <button onClick={handleNewProjectClick} className="create-project-btn">
          <img src={add_img} alt="Add" style={{ marginRight: '8px' }} />
          <span className="monsteratt-font">Add New</span>
        </button>
      </div>
      {showProjectForm && (
        <div className="overlay">
          <div className="modal">
            <button onClick={handleCloseForm}>Close</button>
            <NewProjectForm handleCloseForm={handleCloseForm} handleCreateProject={handleCreateProject} />
          </div>
        </div>
      )}
      <div className="project-container">
        <div className="project-row header-row">
          <div className="project-column">Project Name</div>
          <div className="project-column">Members</div>
        </div>
        {projects.map((project) => (
          <div className="project-row" key={project.id} onClick={() => handleRowClick(project.id)}>
            <div className="project-column">{project.name}</div>
            <div className="project-column">
              {project.members.map((member, index) => (
                <div className='members-element' key={index}>{member.name}{index < project.members.length - 1 ? ',' : ''}</div>
              ))}
            </div>
            <button className="delete-button" onClick={(e) => handleDeleteProject(project.id, e)}>
              <img className="delete-button-img" src={delete_button} alt="Delete" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )

}

export default Table

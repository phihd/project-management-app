import React from 'react'
import { useNavigate } from 'react-router-dom'
import projectService from '../services/projects'
import delete_button from '../img/delete.png'

const Table = ({ projects, queryClient }) => {
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
    if (window.confirm('Are you sure you want to delete this project?')) {
      await projectService.remove(projectId)
      queryClient.setQueryData('projects', old => old.filter(project => project.id !== projectId))
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

export default Table

/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { useContext } from 'react'
import userService from '../services/users'
import projectService from '../services/projects'
import NewProjectForm from './NewProjectForm'
import './Dashboard.css'
import UserContext from './UserContext'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import add_img from '../img/addnew.png'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

import background from '../img/app_background.png'


function Dashboard() {
  const { user } = useContext(UserContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showProjectForm, setShowProjectForm] = useState(false)

  const { data: openIssues, isLoading, isError, error } = useQuery(
    ['openIssues', user?.id],
    () => {
      if (user) {
        return userService.getAssignedIssues(user.id)
          .then(issues => issues
            .filter(issue => issue.status === 'Open')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
          )
      }
      return []
    },
    {
      enabled: !!user
    }
  )

  const handleNewProjectClick = () => {
    setShowProjectForm(true)
  }

  const handleCloseForm = () => {
    setShowProjectForm(false)
  }

  const handleCreateProject = async (newProject) => {
    if (newProject.name !== '') {
      const updatedProject = await projectService.create(newProject)
      queryClient.setQueryData('projects', old => [...old, updatedProject])
      navigate(`/project/${updatedProject.id}`)
    }
  }

  if (isLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>ISSUE DASHBOARD</h2>
        <h3> prioritization is the key to mastering effective workload management. </h3>
      </div>
      <div className="issue-container">
        {openIssues.length > 0 ? (
          openIssues.map((issue) => (
            <div className="issue-row" key={issue.id}>
              <div className="issue-card-header">
                <h4>{issue.title}</h4>
              </div>
              <div className="issue-card-info">
                <p>Due Date: {new Date(issue.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit', month: '2-digit', year: 'numeric'
                })}</p>
                <p>Project: {issue.project.name}</p>
                <p>Assignees: {issue.assignees.map(assignee => assignee.name).join(', ')}</p>
              </div>
              <Link to={`/project/${issue.project.id}/${issue.id}`} className="details-button">
                see details
              </Link>
            </div>

          ))
        ) : (
          <div className="no-open-issues">
            <p>No open issues</p>
            <button onClick={handleNewProjectClick} className="new-project-btn">
              <img src={add_img} alt="Add" style={{ marginRight: '8px' }} />
              <span>Add New Project</span>
            </button>
          </div>
        )}
        </div>
      {showProjectForm && (
        <div className="overlay">
          <div className="modal">
            <NewProjectForm handleCloseForm={handleCloseForm} handleCreateProject={handleCreateProject} />
          </div>
        </div>
      )}
      </div>
  )
}

export default Dashboard

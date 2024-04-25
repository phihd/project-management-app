/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react'
import './ProjectDetail.css'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import projectService from '../services/projects'
import issueService from '../services/issues'
import UserContext from './UserContext'
import NewIssueForm from './NewIssueForm'

import delete_button from '../img/delete.png'

function ProjectDetail() {
  const { projectId } = useParams()
  const { user } = useContext(UserContext)
  const [showIssueForm, setShowIssueForm] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch project details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError
  } = useQuery(['project', projectId], () => projectService.get(projectId), {
    enabled: !!projectId
  })

  // Fetch issues for the project
  const {
    data: issues,
    isLoading: isIssuesLoading,
    isError: isIssuesError,
    error: issuesError
  } = useQuery(['issues', projectId], () => issueService.getAll(projectId), {
    enabled: !!project
  })


  const handleNewIssueClick = () => {
    setShowIssueForm(true)
  }

  const handleCloseForm = () => {
    setShowIssueForm(false)
  }

  const handleDeleteIssue = async (issueId, event) => {
    event.stopPropagation()
    const confirmDelete = window.confirm('Are you sure you want to delete this issue?');
    if (confirmDelete) {
      await issueService.remove(projectId, issueId)
      setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== issueId))
    }
  }

  const handleCreateIssue = async (newIssue) => {
    if (newIssue.title != '') {
      const issue = await issueService.create(projectId, newIssue)
      queryClient.setQueryData(['issues', projectId], old => [...old, issue])
      navigate(`/project/${projectId}/${issue.id}`)
    }
  }

  if (isProjectLoading || isIssuesLoading) return <div>Loading...</div>
  if (isProjectError) return <div>Error loading project: {projectError.message}</div>
  if (isIssuesError) return <div>Error loading issues: {issuesError.message}</div>
  if (!project) return <div>Project not found.</div>


  return (

    <div className="project-detail">
      <div className="project-title-header">
        <h1 className="project-title">{project.name}</h1>
        <div className="header-buttons">
          {/* <button>{project.status.activityStatus}</button> */}
          <button> Tổ Chức Hành Chính </button>
          <button> Status </button>
        </div>
      </div>
      <div className="project-info">
        <div className="project-section">
          <h3>Members</h3>
          <p>
            {project.members.map((member, index) => (
              <div key={index}>{member.name}{index < project.members.length - 1 ? ' ' : ''}</div>
            ))}
          </p>
        </div>
        <div className="project-section">
          <h3>Description</h3>
          {project.description ? (
            project.description.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))
          ) : (
            <p>No description available</p>
          )}
        </div>
      </div>
      <div className="project-issues">
        <h2>Project Issues</h2>
        <div className="issue-controls">
          <span>{issues.length} Open Issues</span>
          <button onClick={handleNewIssueClick}>+ New Issue</button>
        </div>
        <ul className="issue-list">
          {issues.map((issue) => (
            <li key={issue.id} className="issue-item">
              <div>
                <h4>{issue.title}</h4>
                <p>Status: {issue.status}</p>
                <p>{issue.description}</p>
                <p>Comments: {issue.comments.length}</p>
              </div>
              <button className='delete-button' onClick={(e) => handleDeleteIssue(issue.id, e)}>
                <img className='delete-button-img' src={delete_button} alt="Delete" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {showIssueForm && (
        <div className="overlay">
          <div className="modal">
            <button onClick={handleCloseForm}>Close</button>
            <NewIssueForm handleCloseForm={handleCloseForm} handleCreateIssue={handleCreateIssue} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
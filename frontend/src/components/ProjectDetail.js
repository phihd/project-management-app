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
      {user && project.members.some(member => member.id === user.id) &&
        <div className="new-issue-button">
          <button onClick={handleNewIssueClick}>Create New Issue</button>
        </div>
      }
      {showIssueForm && (
        <div className="overlay">
          <div className="modal">
            <button onClick={handleCloseForm}>Close</button>
            <NewIssueForm handleCloseForm={handleCloseForm} handleCreateIssue={handleCreateIssue} />
          </div>
        </div>
      )}
      <h2 className="project-title">{project.name}</h2>
      <div className="project-info">
        <div className="project-section">
          <h3>Status</h3>
          <p>{project.status.activityStatus}</p>
          <p>{project.status.progressStatus}</p>
          <p>{project.status.completionStatus}</p>
        </div>
        <div className="project-section">
          <h3>Department</h3>
          <p>{project.department}</p>
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
        <div className="project-section">
          <h3>Members</h3>
          <ul>
            {project.members.map((member, index) => (
              <li key={index}>{member.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="project-detail-issue-list">
        <h2>Open Issues</h2>
        <ul className="project-detail-issue-list-container">
          {issues.map((issue) => (
            <li key={issue.id} className="project-detail-issue-item">
              <Link to={`/project/${projectId}/${issue.id}`} className="project-detail-issue-link">
                <div className="project-detail-issue-info">
                  <span className="project-detail-issue-title">{issue.title}</span>
                  <span className="project-detail-issue-due-date">
                    {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ProjectDetail
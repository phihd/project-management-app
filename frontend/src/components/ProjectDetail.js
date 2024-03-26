/* eslint-disable */
import React, { useState, useEffect } from 'react'
import './ProjectDetail.css'
import { useParams, Link } from 'react-router-dom'
import issueService from '../services/issues'

import NewIssueForm from './NewIssueForm'

function ProjectDetail({ projects }) {
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issues, setIssues] = useState([])
  const { projectId } = useParams()

  const project = projects.find((project) => project.id === projectId)

  useEffect(() => {
    if (projects.length > 0 && project.id) {
      issueService.getAll(project.id).then(issues =>
        setIssues(issues)
      )
    }
  }, [projects])


  const handleNewIssueClick = () => {
    setShowIssueForm(true)
  }

  const handleCloseForm = () => {
    setShowIssueForm(false)
  }

  const handleCreateIssue = async (newIssue) => {
    if (newIssue.title != '') {
      const issue = await issueService.create(projectId, newIssue)
      setIssues(issues.concat(issue))
    }
  }


  return (
    <div className="project-detail">
      {!issues && <div> Loading... </div>}
      {project && <div>
        <div className="new-issue-button">
          <button onClick={handleNewIssueClick}>Create New Issue</button>
        </div>
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
          <h2>Issues</h2>
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
      }
    </div>
  )
}

export default ProjectDetail
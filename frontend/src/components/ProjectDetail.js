/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react'
import './ProjectDetail.css'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import projectService from '../services/projects'
import issueService from '../services/issues'
import UserContext from './UserContext'
import NewIssueForm from './NewIssueForm'

import delete_button from '../img/delete.png'
import dept_button from '../img/department_button.png'
import status_button from '../img/status_button.png'
import new_issue from '../img/new_issue_btn.png'
import open_status from '../img/open_issue.png'
import close_status from '../img/close_issue.png'
import comment_count from '../img/comment_count.png'

function ProjectDetail() {
  const { projectId } = useParams()
  const { user } = useContext(UserContext)
  const [showIssueForm, setShowIssueForm] = React.useState(false)
  const [openIssues, setOpenIssues] = useState()
  const [sortedIssues, setSortedIssues] = useState()
  const navigate = useNavigate()

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
    enabled: !!project,
    onSuccess: (data) => {
      setOpenIssues(data.filter(issue => issue.status === "Open"))
      setSortedIssues(data.sort((a, b) => {
        if (a.status === 'Open' && b.status !== 'Open') {
          return -1
        }
        if (a.status !== 'Open' && b.status === 'Open') {
          return 1 
        }
        return 0
      }))
    }
  })


  const handleNewIssueClick = () => {
    setShowIssueForm(true)
  }

  const handleCloseForm = () => {
    setShowIssueForm(false)
  }

  const handleNavigateToIssue = (issueId) => {
    navigate(`/project/${projectId}/${issueId}`)
  }

  const handleDeleteIssue = async (issueId, event) => {
    event.stopPropagation()
    const confirmDelete = window.confirm('Are you sure you want to delete this issue?');
    if (confirmDelete) {
      await issueService.remove(projectId, issueId)
      queryClient.setQueryData(['issues', projectId], prevIssues => prevIssues.filter((issue) => issue.id !== issueId))
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
          <button> 
            <img src={dept_button} alt="Department" className="button-img" />
            Phòng Tổ Chức Hành Chính 
          </button>
          <button>
            <img src={status_button} alt="Status" className="button-img" />
            Status 
          </button>
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
      <div className="issues-header">
        <h2>Project Issues</h2>
        <span className="issue-count">{openIssues?.length} open issues</span>
        <button className='new-issue-btn' onClick={handleNewIssueClick}>
          <img src={new_issue} alt="Add New Issue" className="issue-button-img" />
          New Issue
        </button>
      </div>
      <ul className="issue-list">
        {sortedIssues?.map(issue => (
          <li key={issue.id} className={`issue-item ${issue.status.toLowerCase()}`}>
            <div className="issue-content" onClick={() => handleNavigateToIssue(issue.id)}>
              <h4>{issue.title}</h4>
              <button className={`status-btn ${issue.status.toLowerCase()}`}>
                <img src={issue.status === 'Open' ? open_status : close_status} alt={issue.status} />
                {issue.status}
              </button>
            </div>
            {issue.description ? (
                <p> {issue.description} </p>
              ) : (
              <p>No description available</p>
            )}
            <hr />
            <div className="comment-delete-container">
              <div className="comment-count">
                <img src={comment_count} alt="Comments" className="comment-img" />
                {issue.comments.length}
              </div>
              <button className='delete-button' onClick={(e) => handleDeleteIssue(issue.id, e)}>
                <img className='delete-button-img' src={delete_button} alt="Delete" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      </div>
      {showIssueForm && (
        <div className="overlay">
          <div className="modal">
            {/* <button onClick={handleCloseForm}>Close</button> */}
            <NewIssueForm handleCloseForm={handleCloseForm} handleCreateIssue={handleCreateIssue} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail
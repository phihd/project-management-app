/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react'
import './ProjectDetail.css'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import projectService from '../services/projects'
import issueService from '../services/issues'
import userService from '../services/users'
import UserContext from './UserContext'
import NewIssueForm from './NewIssueForm'

import delete_button from '../img/delete.png'
import dept_button from '../img/department_button.png'
import status_button from '../img/status_button.png'
import new_issue from '../img/new_issue_btn.png'
import open_status from '../img/open_issue.png'
import close_status from '../img/close_issue.png'
import comment_count from '../img/comment_count.png'
import edit_project from '../img/pencil.png'

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

function ProjectDetail() {
  const { projectId } = useParams()
  const { user } = useContext(UserContext)
  const [showIssueForm, setShowIssueForm] = React.useState(false)
  const [openIssues, setOpenIssues] = useState()
  const [sortedIssues, setSortedIssues] = useState()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editMembers, setEditMembers] = useState(false)
  const [editDescription, setEditDescription] = useState(false)
  const [membersInput, setMembersInput] = useState([])
  const [descriptionInput, setDescriptionInput] = useState('')

  // Fetch project details
  const {
    data: project,
    isLoading: isProjectLoading,
    isError: isProjectError,
    error: projectError
  } = useQuery(['project', projectId], () => projectService.get(projectId), {
    enabled: !!projectId,
    onSuccess: (data) => {
      setDescriptionInput(data.description || '')
      setMembersInput(data.members.map(member => member.id) || [])
    }
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

  // Fetch users
  const {
    data: allUsers,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError
  } = useQuery('users', () => userService.getAll())

  const handleUpdateProject = async (updateData) => {
    try {
      const updatedProject = await projectService.update(projectId, updateData)
      queryClient.setQueryData(['project', projectId], updatedProject)
      return updatedProject
    } catch (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project.')
    }
  }


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

  const handleSaveMembers = async () => {
    try {
      // Make sure that `membersInput` is always an array
      if (!Array.isArray(membersInput)) {
        setMembersInput([membersInput])
      }
  
      await handleUpdateProject({ members: membersInput })
      setEditMembers(false)
    } catch (error) {
      console.error('Error saving members:', error)
      alert('Failed to save members.')
    }
  }

  const handleSaveDescription = async () => {
    await handleUpdateProject({ description: descriptionInput })
    setEditDescription(false)
  }

  if (isProjectLoading || isIssuesLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
  if (isProjectError) return <div>Error loading project: {projectError.message}</div>
  if (isIssuesError) return <div>Error loading issues: {issuesError.message}</div>
  if (!project) return <div>Project not found.</div>


  return (

    <div className="project-detail">
      <div className="project-title-header">
        <h1 className="project-title">{project.name}</h1>
        <div className="header-buttons">
          {/* <button>{project.status.activityStatus}</button> */}
          {/* <button>
            <img src={dept_button} alt="Department" className="button-img" />
            Phòng Tổ Chức Hành Chính
          </button>
          <button>
            <img src={status_button} alt="Status" className="button-img" />
            Status
          </button> */}
        </div>
      </div>
      <div className="project-info">
        <div className="project-section">
          <div className="project-section-header">
            <h3>Members</h3>
            <button onClick={() => setEditMembers(true)} className="edit-btn">
              <img src={edit_project} alt="Edit Members" />
            </button>
          </div>
          {editMembers ? (
            <div>
              <select
                multiple
                value={membersInput}
                onChange={(e) => setMembersInput(Array.from(e.target.selectedOptions, option => option.value))}
              >
                {allUsers?.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              <button onClick={handleSaveMembers} className="save-btn">Save</button>
              <button onClick={() => setEditMembers(false)} className="cancel-btn">Cancel</button>
            </div>
          ) : (
            <div>
              <p>
                {project.members?.map((member, index) => (
                  <span key={index}>{member.name}{index < project.members.length - 1 ? ',' : ''} </span>
                ))}
              </p>
            </div>
          )}
        </div>
        <div className="project-section">
          <div className="project-section-header">
            <h3>Description</h3>
            <button onClick={() => setEditDescription(true)} className="edit-btn">
              <img src={edit_project} alt="Edit Description" />
            </button>
          </div>
          {editDescription ? (
            <div>
              <textarea
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                className="edit-description"
              />
              <button onClick={handleSaveDescription} className="save-btn">Save</button>
              <button onClick={() => setEditDescription(false)} className="cancel-btn">Cancel</button>
            </div>
          ) : (
            <div>
              {project.description ? (
                project.description.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p>No description available</p>
              )}
            </div>
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
                <p> {issue.description.text} </p>
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
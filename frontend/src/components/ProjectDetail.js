/* eslint-disable */
import React, { useState, useEffect, useContext } from 'react'
import './ProjectDetail.css'
import { useParams, Link } from 'react-router-dom'
import issueService from '../services/issues'
import UserContext from './UserContext'
import NewIssueForm from './NewIssueForm'


import delete_button from '../img/delete.png'

function ProjectDetail({ projects }) {
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [issues, setIssues] = useState([])
  const { projectId } = useParams()
  const { user } = useContext(UserContext)


  const project = projects.find((project) => project.id === projectId)

  useEffect(() => {
    if (projects.length > 0 && project.id) {
      issueService.getAll(project.id)
        .then(issues => {
          setIssues(issues)
        })
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

  const handleDeleteIssue = async (issueId, event) => {
    event.stopPropagation()
    const confirmDelete = window.confirm('Are you sure you want to delete this issue?');
  
    if (confirmDelete) {
      await issueService.remove(projectId, issueId)
      setIssues((prevIssues) => prevIssues.filter((issue) => issue.id !== issueId))
    }
  }

  if (!project) {
    return <div>Loading...</div>;
  }

  // return (
  //   <div className="project-detail">
  //     {!issues && <div> Loading... </div>}
  //     {project && <div>
  //       {project.members.map(member => member.id).includes(user.id) &&
  //         <div className="new-issue-button">
  //           <button onClick={handleNewIssueClick}>Create New Issue</button>
  //         </div>
  //       }
  //       {showIssueForm && (
  //         <div className="overlay">
  //           <div className="modal">
  //             <button onClick={handleCloseForm}>Close</button>
  //             <NewIssueForm handleCloseForm={handleCloseForm} handleCreateIssue={handleCreateIssue} />
  //           </div>
  //         </div>
  //       )}
  //       <h2 className="project-title">{project.name}</h2>
  //       <div className="project-info">
  //         <div className="project-section">
  //           <h3>Status</h3>
  //           <p>{project.status.activityStatus}</p>
  //           <p>{project.status.progressStatus}</p>
  //           <p>{project.status.completionStatus}</p>
  //         </div>
  //         <div className="project-section">
  //           <h3>Department</h3>
  //           <p>{project.department}</p>
  //         </div>
  //         <div className="project-section">
  //           <h3>Description</h3>
  //           {project.description ? (
  //             project.description.split('\n').map((line, index) => (
  //               <p key={index}>{line}</p>
  //             ))
  //           ) : (
  //             <p>No description available</p>
  //           )}
  //         </div>
  //         <div className="project-section">
  //           <h3>Members</h3>
  //           <ul>
  //             {project.members.map((member, index) => (
  //               <li key={index}>{member.name}</li>
  //             ))}
  //           </ul>
  //         </div>
  //       </div>
  //       <div className="project-detail-issue-list">
  //         <h2>Open Issues</h2>
  //         <ul className="project-detail-issue-list-container">
  //           {issues.map((issue) => (
  //             <li key={issue.id} className="project-detail-issue-item">
  //               <Link to={`/project/${projectId}/${issue.id}`} className="project-detail-issue-link">
  //                 <div className="project-detail-issue-info">
  //                   <span className="project-detail-issue-title">{issue.title}</span>
  //                   <span className="project-detail-issue-due-date">
  //                     {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'No due date'}
  //                   </span>
  //                 </div>
  //               </Link>
  //               <button className="delete-button" onClick={(e) => handleDeleteIssue(issue.id, e)}>
  //                 <img className="delete-button-img" src={delete_button} alt="Delete" />
  //               </button>
  //             </li>
  //           ))}
  //         </ul>
  //       </div>
  //     </div>
  //     }
  //   </div>
  // )

  return (
    <div className="project-detail">
      <div className="project-header">
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
              <span key={index}>{member.name}{index < project.members.length - 1 ? ', ' : ''}</span>
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
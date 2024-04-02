/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import userService from '../services/users'
import './ProjectDetail.css'

function Dashboard({ currentUser }) {
  const [openIssues, setOpenIssues] = useState([])

  useEffect(() => {
    // Fetch open issues involving the current user
    const fetchOpenIssues = async () => {
      try {
        const issues = await userService.getAssignedIssues(currentUser.id)
        const openIssues = issues
          .filter(issue => issue.status === 'Open')
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) // Sorting open issues by due date

        setOpenIssues(openIssues)
      } catch (error) {
        console.error('Error fetching open issues:', error)
      }
    }

    if (currentUser) {
      fetchOpenIssues()
    }
  }, [currentUser])

  return (
    <div className="dashboard">
      {openIssues.length > 0 && <div>
        <h2>Open Issues</h2>
        <ul className="project-detail-issue-list">
          {openIssues.map((issue) => (
            <li key={issue.id} className="project-detail-issue-item">
              <Link to={`project/${issue.project.id}/${issue.id}`} className="project-detail-issue-link">
                <div className="project-detail-issue-info">
                  <div>
                    <h3 className="project-detail-issue-title">{issue.title}</h3>
                    <p className="project-detail-issue-due-date">
                      Due Date: {
                        new Date(issue.dueDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                    </p>
                    <Link to={`/project/${issue.project.id}`} className="dashboard-project-link">
                      <p>Project: {issue.project.name}</p>
                    </Link>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      }
    </div>
  )
}

export default Dashboard

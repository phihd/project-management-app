/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import userService from '../services/users'
// import './ProjectDetail.css'
import './Dashboard.css'

function Dashboard({ currentUser }) {
  const [openIssues, setOpenIssues] = useState([])

  useEffect(() => {
    const fetchOpenIssues = async () => {
      if (currentUser) {
        const issues = await userService.getAssignedIssues(currentUser.id);
        const filteredIssues = issues.filter(issue => issue.status === 'Open')
                                     .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        setOpenIssues(filteredIssues);
      }
    };

    fetchOpenIssues();
  }, [currentUser]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Issue Dashboard</h2>
        <div className="search-box">
          <input type="text" placeholder="Find Issue..." />
        </div>
      </div>
      {openIssues.length > 0 ? (
        <div className="issue-container">
          <div className="issue-row header-row" style={{fontWeight: 'bold', backgroundColor: '#171b27'}}>
            <div className="issue-column">Issue Name</div>
            <div className="issue-column">Due Date</div>
            <div className="issue-column">Project</div>
            <div className="issue-column">Assignees</div>
          </div>
          {openIssues.map((issue) => (
            <div className="issue-row" key={issue.id}>
              <div className="issue-column">
                <Link to={`project/${issue.project.id}/${issue.id}`} className="issue-link">
                  {issue.title}
                </Link>
              </div>
              <div className="issue-column">
                {new Date(issue.dueDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </div>
              <div className="issue-column">
                <Link to={`/project/${issue.project.id}`} className="issue-link">
                  {issue.project.name}
                </Link>
              </div>
              <div className="issue-column">
                {issue.assignees.map(assignee => assignee.name).join(', ')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  )  
}

export default React.memo(Dashboard)
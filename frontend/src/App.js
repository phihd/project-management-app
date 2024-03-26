/* eslint-disable */
import React, { useState, useEffect } from 'react'
import './App.css'
import {
  Routes,
  Route,
  Link,
  useParams,
  // useMatch,
  useNavigate
} from 'react-router-dom'

import scqcLogo from './img/LOGO-SCQC-ISO.png'
import user_phihd from './img/user_phihd.jpeg'
import default_avatar from './img/default_avatar.jpg'
import delete_button from './img/delete.png'

import ProjectDetail from './components/ProjectDetail'
import Dashboard from './components/Dashboard'
import NewProjectForm from './components/NewProjectForm'
import IssueDetail from './components/IssueDetail'
import Notification from './components/Notification'
import Login from './components/Login'
import SignUpForm from './components/SignUpForm'
import Procedure from './components/Procedure'
import TemplateDetail from './components/TemplateDetail'
import StepDetail from './components/StepDetail'


import loginService from './services/login'
import projectService from './services/projects'
import homeService from './services/home'
import userService from './services/users'
import { setToken } from './services/tokenmanager'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState({
    text: null,
    isError: false,
  })
  const [projects, setProjects] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [refreshProjects, setRefreshProjects] = useState(false)
  const [showLogin, setShowLogin] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedProjectappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setToken(user.token)

      homeService.getAll().then(response => {
        if (response === 'OK') {
          setUser(user)
        } else {
          setUser(null)
          setToken(null)
        }
      })
    }
  }, [])

  useEffect(() => {
    projectService.getAll().then(projects => {
      setProjects(projects)
    }
    )
  }, [refreshProjects])



  function NavigationBar() {
    return (
      <nav className="navbar">
        <div className="navigation-links">
          <ul>
            <li><a href="#">Dự án & Phòng ban</a></li>
            <li><a href="#">Hoạt động</a></li>
            <li><a href="#">Thảo luận</a></li>
          </ul>
        </div>
      </nav>
    )
  }

  function Sidebar() {
    const [selectedView, setSelectedView] = useState('projects')

    const handleItemClick = (view) => {
      setSelectedView(view)

    }

    return (
      <aside className="sidebar">
        <div className="logo">
          <Link to="/" onClick={() => handleItemClick('')}>
            <img src={scqcLogo} alt="SCQC Logo" />
          </Link>
        </div>
        <ul className="sidebar-content-list">
          <li className={selectedView === 'project' ? 'selected' : ''}>
            <Link to="/project" onClick={() => handleItemClick('project')}>
              Project
            </Link>
          </li>
          <li className={selectedView === 'department' ? 'selected' : ''}>
            <Link to="/department" onClick={() => handleItemClick('department')}>
              Department
            </Link>
          </li>
          <li className={selectedView === 'procedure' ? 'selected' : ''}>
            <Link to="/procedure" onClick={() => handleItemClick('procedure')}>
              Procedure
            </Link>
          </li>
        </ul>
      </aside>
    )
  }

  function Table({ projects }) {
    const navigate = useNavigate()

    // Function to handle status change
    const handleStatusChange = (projectId, newStatus, event) => {
      event.stopPropagation()
      projectId
      newStatus
      // pass
    }

    const handleRowClick = (projectId) => {
      navigate(`/project/${projectId}`)
    }

    const handleDeleteProject = async (projectId, event) => {
      event.stopPropagation()
      const confirmDelete = window.confirm('Are you sure you want to delete this project?');

      if (confirmDelete) {
        await projectService.remove(projectId);
        // Filter out the deleted project and update the projects list
        setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
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


  function Footer() {
    return (
      <footer className="footer">
        <div className="footer-content">
          <a href="https://www.linkedin.com/in/phihd/">Visit PhiThienTai</a>
          <p>Copyright © 2023 PhiThientai. All rights reserved.</p>
        </div>
      </footer>
    )
  }

  const UserDropdown = ({ user, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleDropdown = () => {
      setIsOpen(!isOpen)
    }

    const handleItemClick = (action) => {
      // Perform action based on selected item
      if (action === 'logout') {
        handleLogout()
      }
      // You can add more actions for other options if needed
      setIsOpen(false) // Close the dropdown after action
    }

    return (
      <div className="user-info">
        <button className="user-info-btn" onClick={toggleDropdown}>
          <span>{user.name}</span>
          <img src={user.name == 'Phi Dang' ? user_phihd : default_avatar} alt="User Icon" />
        </button>
        {isOpen && (
          <div className="dropdown-content">
            <button onClick={() => handleItemClick('settings')}>Settings</button>
            <button onClick={() => handleItemClick('logout')}>Log Out</button>
            {/* Add more options as needed */}
          </div>
        )}
      </div>
    )
  }

  function Project() {
    const handleNewProjectClick = () => {
      setShowProjectForm(true)
    }

    const handleCloseForm = () => {
      setShowProjectForm(false)
    }

    const handleCreateProject = async (newProject) => {
      if (newProject.name != '') {
        const project = await projectService.create(newProject)
        setProjects(projects.concat(project))
        setRefreshProjects((prev) => !prev)
      }
    }

    return (
      <div>
        <div className="new-project-button">
          <button onClick={handleNewProjectClick}>Create New Project</button>
        </div>
        {showProjectForm && (
          <div className="overlay">
            <div className="modal">
              <button onClick={handleCloseForm}>Close</button>
              <NewProjectForm handleCloseForm={handleCloseForm} handleCreateProject={handleCreateProject} />
            </div>
          </div>
        )}
        <Table
          projects={projects}
        />
      </div>
    )
  }

  function Department() {

    return (
      <div>
        Cho nay hien ra department
      </div>
    )
  }

  const Main = () => {
    return (
      <Dashboard currentUser={user} />
    )
  }





  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedProjectappUser', JSON.stringify(user)
      )

      setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setMessage({ text: 'wrong username or password', isError: true })
      setTimeout(() => {
        setMessage({ text: null, isError: false })
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedProjectappUser')
    setUser(null)
  }

  const loginForm = () => {
    const handleShowSignUp = () => {
      setShowLogin(false);
      setShowSignUp(true);
    };

    const handleShowLogin = () => {
      setShowSignUp(false);
      setShowLogin(true);
    };

    const handleSignUp = async (name, username, password) => {
      try {
        const newUser = await userService.create(name, username, password)
        if (newUser) {
          handleShowLogin()
        }
      } catch (error) {
        window.alert(error.response.data.error)
      }
    }

    return (
      <div>
        {showLogin &&
          <Login
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
            handleShowSignUp={handleShowSignUp}
          />
        }
        {showSignUp &&
          <SignUpForm
            handleSignUp={handleSignUp}
            handleCloseSignUp={handleShowLogin} // Pass the function to close the sign-up form
          />
        }
      </div>
    )
  }

  const updateProject = async (id, projectToUpdate) => {
    try {
      const updatedProject = await projectService.update(id, projectToUpdate)
      const newProjects = projects.map(
        project => project.id === id ? updatedProject : project
      )
      setProjects(newProjects)
    } catch (exception) {
      setMessage({
        text: exception.response.data.error,
        isError: true
      })
    }
  }

  return (
    <div>
      {user === null && loginForm()}
      {
        user && <div>
          <div className="App">
            <div className="sidebar-wrapper">
              <Sidebar />
            </div>
            <UserDropdown user={user} handleLogout={handleLogout} />
            <div className="content-wrapper">
              <NavigationBar />
              <Notification text={message.text} isError={message.isError} />
              <div className="main-content">
                <Routes>
                  <Route path="/" element={<Main />} />
                  <Route path="/project" element={<Project />} />
                  <Route
                    path="/project/:projectId"
                    element={<ProjectDetail projects={projects} />} />
                  <Route path="/department" element={<Department />} />
                  <Route
                    path="/project/:projectId/:issueId"
                    element={<IssueDetail projects={projects} />}
                  />
                  <Route path="/procedure" element={<Procedure />} />
                  <Route path="/procedure/:templateId" element={<TemplateDetail />} />
                  <Route path="/procedure/:templateId/:stepId" element={<StepDetail />} />
                </Routes>
              </div>
              <Footer />
            </div>

          </div>
        </div>
      }
    </div>
  )
}

// Implement other components such as NavigationBar, Sidebar, Dashboard, Table, Filters, CreateProjectModal, CreateDepartmentModal, and Footer.
// Each component will contain its specific structure and functionality based on the descriptions provided.

export default App

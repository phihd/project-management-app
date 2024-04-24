/* eslint-disable */
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import './App.css'
import {
  Routes,
  Route,
  Link,
  useParams,
  useNavigate
} from 'react-router-dom'

import scqcLogo from './img/LOGO-SCQC-ISO.png'
import user_phihd from './img/user_phihd.jpeg'
import default_avatar from './img/default_avatar.jpg'
import delete_button from './img/delete.png'
import noti_img from './img/noti_img.png'
import sidebar_img from './img/sidebar_img.png'
import add_img from './img/addnew.png'

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

import UserContext from './components/UserContext'

import loginService from './services/login'
import projectService from './services/projects'
import homeService from './services/home'
import userService from './services/users'
import { setToken } from './services/tokenmanager'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({
    text: null,
    isError: false,
  })
  const [projects, setProjects] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [refreshProjects, setRefreshProjects] = useState(false)
  const [showLogin, setShowLogin] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false)

  const { user, setUser } = useContext(UserContext)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const sidebarRef = useRef(null)

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev)
  }, [])
  

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




  function NavigationBar({ toggleSidebar }) {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([])
    const buttonRef = useRef(null)
    
  
    // Function to simulate fetching notifications from the server
    const fetchNotifications = () => {
      const simulatedNotifications = [
        { id: 1, message: 'New notification 1', read: true },
        { id: 2, message: 'New notification 2', read: false },
        { id: 3, message: 'New notification 3', read: false },
      ]
  
      setNotifications(simulatedNotifications);
    }
  
    // Function to handle notification button click
    const handleNotificationClick = () => {
      setShowNotifications(!showNotifications)
    }

      // Function to mark a notification as read and navigate
    const handleNotificationLinkClick = (e, id) => {
      e.preventDefault(); // Prevent the default link behavior
      
      // First mark the notification as read
      markNotificationAsRead(id).then(() => {
        // After marking as read, navigate to the notification's link
        window.location.href = `/project/659bcbab51659ac5c226fb12/659bcc7151659ac5c226fb46`;
      });
    };

    // Improved function to mark a notification as read
    const markNotificationAsRead = (id) => {
      return new Promise(resolve => {
        setNotifications(prevNotifications => {
          return prevNotifications.map(notification => {
            if (notification.id === id) {
              return { ...notification, read: true };
            }
            return notification;
          });
        });
        resolve();
      });
    };
  
    useEffect(() => {
      fetchNotifications();
    }, []);

      // Calculate the number of unread notifications
    const numberOfUnreadNotifications = notifications.filter(notification => !notification.read).length
  
    return (
      <div className="navbar">
        <div className="logo">
          <Link to="/" onClick={() => handleItemClick('')}>
            <img className='logo' src={scqcLogo} alt="SCQC Logo" />
          </Link>
        </div>
        {/* <div className="navigation-links">
          <ul>
            <li><a href="#">Dự án & Phòng ban</a></li>
            <li><a href="#">Hoạt động</a></li>
            <li><a href="#">Thảo luận</a></li>
          </ul>
        </div> */}
        <div className="toolbar-buttons">
          {/* Toggle Sidebar Button */}
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            <img src={sidebar_img} alt="Toggle Sidebar" />
          </button>
          <div className="notification">
            <button ref={buttonRef} className="notification-btn" onClick={handleNotificationClick}>
              <img src={noti_img} alt="Notification" />
              {numberOfUnreadNotifications > 0 && (
                <span className="notification-count">{numberOfUnreadNotifications}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notification-popup" style={{ top: buttonRef.current.offsetTop + buttonRef.current.offsetHeight }}>
                <div className="notification-panel">
                  {notifications.map(notification => (
                    <a
                      key={notification.id}
                      href={`/project/659bcbab51659ac5c226fb12/659bcc7151659ac5c226fb46`}
                      className={`notification-link ${notification.read ? 'read' : 'unread'}`}
                      onClick={(e) => handleNotificationLinkClick(e, notification.id)}
                    >
                      <div>{notification.message}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ) 
  }

  function Sidebar({ isVisible }) {
    const [selectedView, setSelectedView] = useState('projects')

    const handleItemClick = (view) => {
      setSelectedView(view)
      toggleSidebar()
    }

    return (
      <aside className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
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

  // function Table({ projects }) {

  //   return (
  //     <section className="table">
  //       <table>
  //         <thead>
  //           <tr>
  //             <th>Project Name</th>
  //             {/* <th>Status</th>
  //             <th>Department</th> */}
  //             <th>Members</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {projects.map((project) => (
  //             <tr key={project.id} onClick={() => handleRowClick(project.id)}>
  //               <td>{project.name}</td>
  //               {/* <td>
  //                 <div className="status-buttons">
  //                   <button
  //                     onClick={(e) => handleStatusChange(project.id, project.status.activityStatus, e)}
  //                     className={`status-button ${project.status.activityStatus.toLowerCase()}`}
  //                   >
  //                     {project.status.activityStatus}
  //                   </button>
  //                   <button
  //                     onClick={(e) => handleStatusChange(project.id, project.status.progressStatus, e)}
  //                     className={`status-button ${project.status.progressStatus.toLowerCase().replace(/\s/g, '')}`}
  //                   >
  //                     {project.status.progressStatus}
  //                   </button>
  //                   <button
  //                     onClick={(e) => handleStatusChange(project.id, project.status.completionStatus, e)}
  //                     className={`status-button ${project.status.completionStatus.toLowerCase()}`}
  //                   >
  //                     {project.status.completionStatus}
  //                   </button>
  //                 </div>
  //               </td> */}
  //               {/* <td>{project.department}</td> */}
  //               <td>
  //                 {project.members.map((member) => (
  //                   <span key={member.id}>
  //                     {member.name}
  //                     {member !== project.members[project.members.length - 1] && ', '}
  //                   </span>
  //                 ))}
  //               </td>
  //               <td>
  //                 <button className="delete-button" onClick={(e) => handleDeleteProject(project.id, e)}>
  //                   <img className="delete-button-img" src={delete_button} alt="Delete" />
  //                 </button>
  //               </td>
  //             </tr>
  //           ))}
  //         </tbody>
  //       </table>
  //     </section>
  //   )
  // }


  function Footer({ children }) {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* <a href="https://www.linkedin.com/in/phihd/">Visit PhiThienTai</a> */}
        {/* <p>Copyright © 2023 PhiThientai. All rights reserved.</p> */}
      </div>
      <div className="user-dropdown">{children}</div>
    </footer>
  );
}

  const UserDropdown = ({ user, handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isOpenEmailForm, setIsOpenEmailForm] = useState(false)
    const [email, setEmail] = useState('')
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen)
    }
  
    const handleItemClick = (action) => {
      if (action === 'settings') {
        toggleEmailForm()
      } else if (action === 'logout') {
        handleLogout()
      }
      setIsOpen(false)
    }
  
    const toggleEmailForm = () => {
      setIsOpenEmailForm(!isOpenEmailForm)
    }
  
    const handleEmailChange = (event) => {
      setEmail(event.target.value)
    }
  
    const handleSubmitEmail = (event) => {
      event.preventDefault();
      console.log('Email submitted:', email)
      setEmail('')
      setIsOpenEmailForm(false)
    }

    const handleCloseForm = () => {
      setIsOpenEmailForm(false)
    }
  
    return (
      <div className="user-info">
        <button className="user-info-btn" onClick={toggleDropdown}>
          <p className="monsteratt-font">{user.name}</p>
          <img src={user.name === 'Phi Dang' ? user_phihd : default_avatar} alt="User Icon" />
        </button>
        {isOpen && (
          <div className="dropdown-content">
            <button onClick={() => handleItemClick('settings')}>Settings</button>
            <button onClick={() => handleItemClick('logout')}>Log Out</button>
          </div>
        )}
        {isOpenEmailForm && (
          <div className="email-form">
            <button className="close-btn" onClick={handleCloseForm}>X</button>
            <form onSubmit={handleSubmitEmail}>
              <input type="email" value={email} onChange={handleEmailChange} placeholder="Enter email" />
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
      </div>
    )
  }
  

    function Project() {

      const navigate = useNavigate()

      const handleStatusChange = (projectId, newStatus, event) => {
        event.stopPropagation()
        projectId
        newStatus
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

      const handleNewProjectClick = () => {
        setShowProjectForm(true)
      }

      const handleCloseForm = () => {
        setShowProjectForm(false)
      }
      
      const handleRowClick = (projectId) => {
        navigate(`/project/${projectId}`)
      }

      const handleCreateProject = async (newProject) => {
        if (newProject.name != '') {
          const project = await projectService.create(newProject)
          setProjects(projects.concat(project))
          setRefreshProjects((prev) => !prev)
        }
      }

      return (
        <div className="project-page">
          <div className="project-header">
            <h2>Project Dashboard</h2>
            <button onClick={handleNewProjectClick} className="create-project-btn">
              <img src={add_img} alt="Add" style = {{marginRight: '8px'}} />
              <span className="monsteratt-font">Add New</span>
            </button>
          </div>
          {showProjectForm && (
            <div className="overlay">
              <div className="modal">
                <button onClick={handleCloseForm}>Close</button>
                <NewProjectForm handleCloseForm={handleCloseForm} handleCreateProject={handleCreateProject} />
              </div>
            </div>
          )}
          <div className="project-container">
            <div className="project-row header-row">
              <div className="project-column">Project Name</div>
              <div className="project-column">Members</div>
            </div>
            {projects.map((project) => (
              <div className="project-row" key={project.id} onClick={() => handleRowClick(project.id)}>
                <div className="project-column">{project.name}</div>
                <div className="project-column">
                  {project.members.map((member, index) => (
                    <div className='members-element' key={index}>{member.name}{index < project.members.length - 1 ? ',' : ''}</div>
                  ))}
                </div>
                  <button className="delete-button" onClick={(e) => handleDeleteProject(project.id, e)}>
                    <img className="delete-button-img" src={delete_button} alt="Delete" />
                  </button>
              </div>
            ))}
          </div>
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

  const Main = useCallback(() => {
    return <Dashboard currentUser={user} />
  }, [user])


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
        <NavigationBar toggleSidebar={() => setIsSidebarVisible(prev => !prev)} />
      <div className={`sidebar-wrapper ${isSidebarVisible ? '' : 'hidden'}`}>
        <Sidebar isVisible={isSidebarVisible} />
      </div>
      <div className={`content-wrapper ${isSidebarVisible ? 'shifted' : ''}`}>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/project" element={<Project />} />
            <Route path="/project/:projectId" element={<ProjectDetail projects={projects} />} />
            <Route path="/department" element={<Department />} />
            <Route path="/project/:projectId/:issueId" element={<IssueDetail projects={projects} />} />
            <Route path="/procedure" element={<Procedure />} />
            <Route path="/procedure/:templateId" element={<TemplateDetail />} />
            <Route path="/procedure/:templateId/:stepId" element={<StepDetail />} />
          </Routes>
        </div>
        </div>
          <Footer>
              <UserDropdown user={user} handleLogout={handleLogout} />
          </Footer>
        </div>
        </div>
      }
    </div>
  )
}

// Implement other components such as NavigationBar, Sidebar, Dashboard, Table, Filters, CreateProjectModal, CreateDepartmentModal, and Footer.
// Each component will contain its specific structure and functionality based on the descriptions provided.

export default App

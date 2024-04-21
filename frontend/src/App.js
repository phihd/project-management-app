/* eslint-disable */
import React, { useState, useEffect, useContext, useRef } from 'react'
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
import noti_img from './img/noti_img.png'

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
import Project from './components/Project'

import UserContext from './components/UserContext'

import loginService from './services/login'
import projectService from './services/projects'
import homeService from './services/home'
import userService from './services/users'
import notiService from './services/notifications'
import { setToken } from './services/tokenmanager'

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({
    text: null,
    isError: false,
  })
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  const { user, setUser } = useContext(UserContext)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const sidebarRef = useRef(null)


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



  const useNotifications = () => {
    const [notifications, setNotifications] = useState([])
    const { user } = useContext(UserContext)

    useEffect(() => {
      if (user) {
        notiService.getAll().then(data => {
          const notiByUser = data.filter(noti => noti.user === user.id)
          setNotifications(notiByUser)
        }).catch(error => console.error('Failed to fetch notifications:', error))
      }
    }, [user])  // Depend on user to refetch when user changes

    return { notifications, setNotifications }
  }


  function NavigationBar({ toggleSidebar }) {
    const { notifications, setNotifications } = useNotifications()
    const [showNotifications, setShowNotifications] = useState(false)
    const buttonRef = useRef(null)


    // Function to handle notification button click
    const handleNotificationClick = () => {
      setShowNotifications(!showNotifications)
    }

    // Function to mark a notification as read and navigate
    const handleNotificationLinkClick = (e, id) => {
      e.preventDefault() // Prevent the default link behavior

      // First mark the notification as read
      markNotificationAsRead(id).then(() => {
        // After marking as read, navigate to the notification's link
        window.location.href = `/project/659bcbab51659ac5c226fb12/659bcc7151659ac5c226fb46`
      })
    }

    // Improved function to mark a notification as read
    const markNotificationAsRead = (id) => {
      return new Promise(resolve => {
        setNotifications(prevNotifications => {
          return prevNotifications.map(notification => {
            if (notification.id === id) {
              return { ...notification, read: true }
            }
            return notification
          })
        })
        resolve()
      })
    }

    // Calculate the number of unread notifications
    const numberOfUnreadNotifications = notifications.filter(notification => !notification.read).length

    return (
      <nav className="navbar">
        <div className="logo">
          <Link to="/" onClick={() => handleItemClick('')}>
            <img src={scqcLogo} alt="SCQC Logo" />
          </Link>
        </div>
        {/* Toggle Sidebar Button */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          Toggle Sidebar
        </button>
        <div className="navigation-links">
          <ul>
            {/* <li><a href="#">Dự án & Phòng ban</a></li>
            <li><a href="#">Hoạt động</a></li>
            <li><a href="#">Thảo luận</a></li> */}
          </ul>
        </div>
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
      </nav>
    )
  }

  function Sidebar({ isVisible }) {
    const [selectedView, setSelectedView] = useState('projects')

    const handleItemClick = (view) => {
      setSelectedView(view)

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

  const UserDropdown = ({ handleLogout }) => {
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
      event.preventDefault()
      console.log(user.id)
      userService.update(user.id.toString(), { email: email })
        .then(response => {
          console.log('Email submitted:', email)
          setEmail('')
          setIsOpenEmailForm(false)
        })
        .catch(error => console.error('Failed to update email:', error))
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

  function Department() {

    return (
      <div>
        {/* Cho nay hien ra department */}
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
      setShowLogin(false)
      setShowSignUp(true)
    }

    const handleShowLogin = () => {
      setShowSignUp(false)
      setShowLogin(true)
    }

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

  return (
    <div>
      {user === null && loginForm()}
      {
        user && <div>
          <div className="App">
            <div className="navbar">
              <NavigationBar toggleSidebar={() => setIsSidebarVisible(prev => !prev)} />
            </div>
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

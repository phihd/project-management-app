/* eslint-disable */
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import './App.css'
import {
  Routes,
  Route,
  Link,
  useLocation,
  useParams,
  // useMatch,
  useNavigate
} from 'react-router-dom'

import scqcLogo from './img/LOGO-SCQC-ISO.png'
import user_phihd from './img/user_phihd.jpeg'
import default_avatar from './img/default_avatar.jpg'
import noti_img from './img/noti_img.png'
import sidebar_img from './img/sidebar_img.png'

import ProjectDetail from './components/ProjectDetail'
import Dashboard from './components/Dashboard'
import NewProjectForm from './components/NewProjectForm'
import IssueDetail from './components/IssueDetail'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
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

  const [projects, setProjects] = useState([])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const sidebarRef = useRef(null)
  const { user, setUser } = useContext(UserContext)
  const queryClient = useQueryClient()
  const location = useLocation();
  const currentRoute = location.pathname;  // This holds the current path


  const handleLogout = () => {
    window.localStorage.removeItem('loggedProjectappUser')
    queryClient.removeQueries('user');
    setUser(null)
    setShowLogin(true)
  }

  // Fetch user
  const { isLoading: userLoading, isError: userError, error: userErrorMessage } = useQuery('user', userService.getUserFromLocalStorage, {
    onSuccess: (userData) => {
      setUser(userData)
      setShowLogin(false)
    },
    onError: () => {
      handleLogout()
      setShowLogin(true)
    },
    enabled: !!localStorage.getItem('loggedProjectappUser'),
    retry: false,
    refetchOnWindowFocus: false
  })

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery(
    'notifications',
    () => notiService.getAll(user.id),
    {
      enabled: !!user && !!user.token,
      onError: (error) => {
        if (error.response && error.response.status === 401) { // Handle unauthorized access (e.g., token expiration)
          handleLogout()
          setShowLogin(true)
        }
      },
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
    }
  )

  if (userLoading) return <div>Loading user data...</div>
  if (notificationsLoading) return <div>Loading notifications...</div>

  function NavigationBar({ toggleSidebar }) {
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
      <div className="navbar">
        <div className="logo">
          <Link to="/" onClick={() => handleItemClick('')}>
            <img className='logo' src={scqcLogo} alt="SCQC Logo" />
          </Link>
        </div>
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

  function Department() {

    return (
      <div>
        {/* Cho nay hien ra department */}
      </div>
    )
  }

  const Main = () => {
    return (
      <Dashboard />
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
      queryClient.setQueryData('user', user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setMessage({ text: 'wrong username or password', isError: true })
      setTimeout(() => {
        setMessage({ text: null, isError: false })
      }, 5000)
    }
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
          <LoginForm
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
        user && 
        <div>
          <div className="App">
            <NavigationBar toggleSidebar={() => setIsSidebarVisible(prev => !prev)} />
          <div className={`sidebar-wrapper ${isSidebarVisible ? '' : 'hidden'}`}>
            <Sidebar isVisible={isSidebarVisible} />
          </div>
          <div className={`content-wrapper ${isSidebarVisible ? 'shifted' : ''}`}>
            <div className={`main-content ${currentRoute === '/' ? 'dashboard-active' : ''}`}>
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

export default App

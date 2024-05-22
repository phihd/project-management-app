/* eslint-disable */
import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
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
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

import scqcLogo from './img/LOGO-SCQC-ISO.png'
import user_phihd from './img/user_phihd.jpeg'
import default_avatar from './img/default_avatar.png'
import noti_img from './img/noti_img.png'
import sidebar_img from './img/sidebar_img.png'

import ProjectDetail from './components/ProjectDetail'
import Dashboard from './components/Dashboard'
import IssueDetail from './components/IssueDetail'
import LoginForm from './components/LoginForm'
import SignUpForm from './components/SignUpForm'
import Procedure from './components/Procedure'
import TemplateDetail from './components/TemplateDetail'
import StepDetail from './components/StepDetail'
import Project from './components/Project'

import UserContext from './components/UserContext'

import loginService from './services/login'
import userService from './services/users'
import notiService from './services/notifications'
import { setToken } from './services/tokenmanager'



const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginErrorMessage, setLoginErrorMessage] = useState(null)
  const [signUpErrorMessage, setSignUpErrorMessage] = useState(null)
  const [showLogin, setShowLogin] = useState(true)
  const [showSignUp, setShowSignUp] = useState(false)

  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const { user, setUser } = useContext(UserContext)
  const location = useLocation()
  const currentRoute = location.pathname  // This holds the current path
  const queryClient = useQueryClient()
  const navigate = useNavigate()


  const handleLogout = () => {
    window.localStorage.removeItem('loggedProjectappUser')
    queryClient.removeQueries('user')
    setUser(null)
    setShowLogin(true)
    queryClient.clear()
  }

  // Interceptor to logout when token expires
  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response) {
          // Specifically handle token expiration scenario
          if (error.response.status === 401 && error.response.data.error === "token expired") {
            handleLogout()
            alert('Your session has expired. Please log in again.')
          } else if (error.response.status === 401 && error.response.data.error === "Invalid username or password") {
            
          } else if (error.response.status === 401 || error.response.status === 403) {
            // Handle other unauthorized access without logging out
            alert('You are not authorized to perform this action.')
          }
        }
        return Promise.reject(error)
      }
    )


    // Cleanup function to remove interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(axiosInterceptor)
    }
  }, [])

  // Fetch user
  const { isLoading: userLoading, isError: userError, error: userErrorMessage } = useQuery(
    'user',
    userService.getUserFromLocalStorage,
    {
      staleTime: 5 * 60 * 1000,
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
    () => notiService.get(user.id),
    {
      staleTime: 5 * 60 * 1000,
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

  if (userLoading || notificationsLoading) {
    NProgress.start()
    return (
      <div className='App'>
        <div className='navbar'>
          <div className='logo'>
            <Link to="/" onClick={() => handleItemClick('')}>
              <img className='logo' src={scqcLogo} alt="SCQC Logo" />
            </Link>
          </div>
        </div>
        <div className='content-wrapper'></div>
        <footer className='footer'></footer>
      </div>
    )
  } else {
    NProgress.done()
  }

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
      markNotificationAsRead(id)
      // After marking as read, navigate to the notification's link

      window.location.href = notifications.find(noti => noti.id === id).url
    }

    // Improved function to mark a notification as read
    const markNotificationAsRead = async (id) => {
      await notiService.update(id, { read: true })
      const updatedNotifications = notifications.map(notification => {
        if (notification.id === id) {
          return { ...notification, read: true }
        }
        return notification
      })

      queryClient.setQueryData('notifications', updatedNotifications)
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
          {/* <li className={selectedView === 'department' ? 'selected' : ''}>
            <Link to="/department" onClick={() => handleItemClick('department')}>
              Department
            </Link>
          </li>
          <li className={selectedView === 'procedure' ? 'selected' : ''}>
            <Link to="/procedure" onClick={() => handleItemClick('procedure')}>
              Procedure
            </Link>
          </li> */}
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
    )
  }

  const UserDropdown = ({ handleLogout }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isOpenProfileForm, setIsOpenProfileForm] = useState(false)
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const formRef = useRef(null)
    const { user, setUser } = useContext(UserContext)

    const toggleDropdown = () => {
      setIsOpen(!isOpen)
    }

    const handleItemClick = (action) => {
      if (action === 'settings') {
        toggleProfileForm()
      } else if (action === 'logout') {
        handleLogout()
      }
      setIsOpen(false)
    }

    const toggleProfileForm = () => {
      setIsOpenProfileForm(!isOpenProfileForm);
      if (!isOpenProfileForm) {
        document.addEventListener('mousedown', handleClickOutside)
      } else {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }

    const handleEmailChange = (event) => {
      setEmail(event.target.value)
    }
  
    const handleNameChange = (event) => {
      setName(event.target.value)
    }

    const handleSubmitProfile = async (event) => {
      event.preventDefault();
      try {
        const updatedUser = await userService.update(user.id.toString(), { email, name })
        const newUser = { ...user, email: updatedUser.email, name: updatedUser.name }
        setUser(newUser)
        setEmail('')
        setName('')
        setIsOpenProfileForm(false)
      } catch (error) {
        console.error('Failed to update profile:', error)
      }
    }

    const handleCloseForm = () => {
      setIsOpenProfileForm(false)
      document.removeEventListener('mousedown', handleClickOutside)
    }

    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        handleCloseForm()
      }
    }

    return (
      <div className="user-info">
        <button className="user-info-btn" onClick={toggleDropdown}>
          <p className="monsteratt-font">{user.name}</p>
          <img src={user.name === 'Phi Dang' ? user_phihd : default_avatar} alt="User Icon" />
        </button>
        {isOpen && (
          <div className="dropdown-content">
            <button onClick={() => handleItemClick('settings')}>Edit Profile</button>
            <button onClick={() => handleItemClick('logout')}>Log Out</button>
          </div>
        )}
        {isOpenProfileForm && (
        <div className="profile-form-overlay">
          <div className="profile-form" ref={formRef}>
            <button className="close-btn" onClick={handleCloseForm}> x </button>
            <form onSubmit={handleSubmitProfile}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder={user.name ? `Current name: ${user.name}` : "Enter your new name"}
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder={user.email ? `Current email: ${user.email}` : 'Enter email to receive notifications'}
              />
              <button type="submit">Save</button>
            </form>
          </div>
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
      setLoginErrorMessage('Incorrect username or password')
      throw exception
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
        setSignUpErrorMessage(error.response.data.error)
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
            errorMessage={loginErrorMessage}
          />
        }
        {showSignUp &&
          <SignUpForm
            handleSignUp={handleSignUp}
            handleCloseSignUp={handleShowLogin}
            errorMessage={signUpErrorMessage}
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
                  <Route path="/project/:projectId" element={<ProjectDetail />} />
                  <Route path="/department" element={<Department />} />
                  <Route path="/project/:projectId/:issueId" element={<IssueDetail />} />
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

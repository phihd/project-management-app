import React, { useState } from 'react'
import './SignUpForm.css'

const SignUpForm = ({ handleSignUp, handleCloseSignUp }) => {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handleNameChange = (event) => {
    setName(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (password === confirmPassword) {
      handleSignUp(name, username, password)
    } else {
      // Handle password mismatch error
      // For example: set an error state
    }
  }

  return (
    <div className="signup-body">
      <div className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Sign Up</h2>
          <div className="signup-input-group">
            <label>Name:</label>
            <input
              type="text"
              id="Name"
              name="Name"
              placeholder="Enter your profile name"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={handleUsernameChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="signup-input-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
            />
          </div>
          <button className="signup-button" type="submit">
            Sign Up
          </button>
          <button className="back-to-login-button" onClick={handleCloseSignUp}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default SignUpForm
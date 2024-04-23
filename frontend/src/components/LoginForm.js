/* eslint-disable */
import React, { useState, useEffect } from 'react'
import './LoginForm.css'

const Login = ({
  handleSubmit,
  handleUsernameChange,
  handlePasswordChange,
  username,
  password,
  handleShowSignUp
}) => {
  return (
    <div className="login-body">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <div className="login-input-group">
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
          <div className="login-input-group">
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
          <button className="login-button" type="submit">Login</button>
          <div className="login-signup-link">
            Don&apos;t have an account? <a href="#" onClick={handleShowSignUp}> Sign Up </a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

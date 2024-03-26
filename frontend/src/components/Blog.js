import React from 'react'
import { useState } from 'react'

const Blog = ({ blog, updateLikes, deleteBlog, current_username }) => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    setVisible(!visible)
  }

  const handleLike = () => {
    const blogToUpdate = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: blog.likes + 1,
      user: blog.user.id,
    }
    updateLikes(blog.id, blogToUpdate)
  }

  const handleDelete = () => {
    if (window.confirm(
      `Remove blog ${blog.title} by ${blog.author}?`
    )) {
      deleteBlog(blog.id)
    }
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div className='blog' style={blogStyle}>
      <div>
        <span className='title'>{blog.title} - </span>
        <span className='author'>{blog.author} </span>
        <button onClick={toggleVisibility}>
          {visible ? 'hide' : 'view'}
        </button>
      </div>
      {visible && (
        <div className='details'>
          <div>{blog.url}</div>
          <div>
            Likes: {blog.likes}{' '}
            <button id='like-button' onClick={handleLike}>
              like
            </button>
          </div>
          <div>{blog.user.name}</div>
          {blog.user.username === current_username && (
            <button id='delete-button' onClick={handleDelete}>
              delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Blog
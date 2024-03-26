import React from 'react'
import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: ''
  })

  const handleBlogChange = (event) => {
    const { name, value } = event.target
    setNewBlog({ ...newBlog, [name]: value })
  }

  const handleCreateNewBlog = async (event) => {
    event.preventDefault()
    createBlog(newBlog)
    setNewBlog({ title: '', author: '', url: '' })
  }

  return (
    <div>
      <h2>create new blog</h2>
      <form onSubmit={handleCreateNewBlog}>
        <div>
          title:
          <input
            type='text'
            value={newBlog.title}
            name='title'
            onChange={handleBlogChange}
            id='title-input'
          />
        </div>
        <div>
          author:
          <input
            type='text'
            value={newBlog.author}
            name='author'
            onChange={handleBlogChange}
            id='author-input'
          />
        </div>
        <div>
          url:
          <input
            type='text'
            value={newBlog.url}
            name='url'
            onChange={handleBlogChange}
            id='url-input'
          />
        </div>
        <button id = 'create-form-button' type='submit'>create</button>
      </form>
    </div>
  )
}

export default BlogForm
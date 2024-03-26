// NewTemplateForm.js

import React, { useState } from 'react'

const NewTemplateForm = ({ handleCreateTemplate, handleCloseForm }) => {
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const newTemplate = {
      name: templateName,
      description: templateDescription,
    }
    handleCreateTemplate(newTemplate)
    handleCloseForm()
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New Template</h2>
      <div>
        <label htmlFor="templateName">Name:</label>
        <input
          type="text"
          id="templateName"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="templateDescription">Description:</label>
        <textarea
          id="templateDescription"
          value={templateDescription}
          onChange={(e) => setTemplateDescription(e.target.value)}
        ></textarea>
      </div>
      <button type="submit">Create Template</button>
    </form>
  )
}

export default NewTemplateForm
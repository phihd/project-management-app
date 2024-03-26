// Procedure.js
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Procedure.css'
import './NewTemplateForm'
import NewTemplateForm from './NewTemplateForm'

const Procedure = () => {
  const [templates, setTemplates] = useState([])
  const [showCreateTemplateForm, setShowCreateTemplateForm] = useState(false)

  const handleCreateTemplate = (newTemplate) => {
    newTemplate.id = templates.length + 1
    setTemplates((prevTemplates) => [...prevTemplates, newTemplate])
    setShowCreateTemplateForm(false)
  }

  const handleCloseForm = () => {
    setShowCreateTemplateForm(false)
  }


  return (
    <div className="procedure-container">
      <h2>Procedure</h2>
      <div className="template-section">
        <h3>Create New Template</h3>
        <button onClick={() => setShowCreateTemplateForm(true)}>Create Template</button>
      </div>
      <div className="template-section">
        <h3>Procedure Templates</h3>
        <ul>
          {templates.map((template) => (
            <li key={template.id}>
              <Link to={`/procedure/${template.id}`}>{template.name}</Link>
            </li>
          ))}
        </ul>
      </div>
      {showCreateTemplateForm && (
        <NewTemplateForm handleCreateTemplate={handleCreateTemplate} handleCloseForm={handleCloseForm} />
      )}
    </div>
  )
}

export default Procedure

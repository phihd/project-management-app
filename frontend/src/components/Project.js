import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import NewProjectForm from './NewProjectForm'
import projectService from '../services/projects'
import Table from './Table' // Assuming Table is a separate component

const Project = () => {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: projects, isLoading, isError, error } = useQuery('projects', projectService.getAll, {})

  const handleNewProjectClick = () => {
    setShowProjectForm(true)
  }

  const handleCloseForm = () => {
    setShowProjectForm(false)
  }

  const handleCreateProject = async (newProject) => {
    if (newProject.name !== '') {
      const updatedProject = await projectService.create(newProject)
      queryClient.setQueryData('projects', old => [...old, updatedProject])
    }
  }

  if (isLoading) return <div>Loading projects...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div>
      <div className="new-project-button">
        <button onClick={handleNewProjectClick}>Create New Project</button>
      </div>
      {showProjectForm && (
        <div className="overlay">
          <div className="modal">
            <button onClick={handleCloseForm}>Close</button>
            <NewProjectForm handleCloseForm={handleCloseForm} handleCreateProject={handleCreateProject} />
          </div>
        </div>
      )}
      <Table projects={projects || []} queryClient={queryClient} />
    </div>
  )
}

export default Project

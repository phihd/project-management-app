import React, { useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import projectService from '../services/projects'
import Table from './Table'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

const Project = () => {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

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
      navigate(`/project/${updatedProject.id}`)
    }
  }

  if (isLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div>
      <Table
        projects={projects || []} handleNewProjectClick={handleNewProjectClick}
        showProjectForm={showProjectForm}
        handleCloseForm={handleCloseForm}
        handleCreateProject={handleCreateProject}
        queryClient={queryClient}
      />
    </div>
  )
}

export default Project

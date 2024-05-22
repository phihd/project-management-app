import React, { useContext, useState } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import projectService from '../services/projects'
import Table from './Table'
import NProgress from 'nprogress'
import UserContext from './UserContext'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500, showSpinner: false })

const Project = () => {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useContext(UserContext)

  const { data: projects, isLoading, isError, error } = useQuery('projects', projectService.getAll, {})

  const handleNewProjectClick = () => {
    setShowProjectForm(true)
  }

  const handleCloseForm = () => {
    setShowProjectForm(false)
  }

  const handleCreateProject = async (newProject) => {
    NProgress.start()
    if (newProject.name !== '') {
      const updatedProject = await projectService.create(newProject)
      queryClient.setQueryData('projects', old => [...old, updatedProject])
      navigate(`/project/${updatedProject.id}`)
    }
    NProgress.done()
  }

  const handleDeleteProject = async (projectId) => {
    try {
      NProgress.start()
      await projectService.remove(projectId)
      queryClient.setQueryData('projects', old => old.filter(project => project.id !== projectId))
      NProgress.done()
    } catch (error) {
      console.error('Failed to delete the project:', error)
      NProgress.done()
    }
  }

  if (isLoading) {
    NProgress.start()
    return
  } else {
    NProgress.done()
  }
  if (isError) return <div>Error: {error.message}</div>

  const userProjects = projects?.filter(project => project.members.some(member => member.id === user.id))


  return (
    <div>
      <Table
        projects={userProjects || []}
        handleNewProjectClick={handleNewProjectClick}
        showProjectForm={showProjectForm}
        handleCloseForm={handleCloseForm}
        handleCreateProject={handleCreateProject}
        handleDeleteProject={handleDeleteProject}
        queryClient={queryClient}
      />
    </div>
  )
}

export default Project

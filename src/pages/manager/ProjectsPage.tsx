import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { LayoutGrid, List, Plus, Search, Filter, Calendar, Users, Edit, Trash2, ChevronDown, ChevronUp, UserX } from 'lucide-react'
import { getAllProjects, getAllAssignments, deleteProject, deleteAssignment, getUserById, getProjectsByStatus } from '@/services/firebaseService'
import type { Project, Assignment, ProjectStatus, User } from '@/types'
import { format } from 'date-fns'
import { ProjectDialog } from '@/components/forms/ProjectDialog'
import { AssignmentDialog } from '@/components/forms/AssignmentDialog'
import { DeleteConfirmDialog } from '@/components/forms/DeleteConfirmDialog'

export const ProjectsPage = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [projects, setProjects] = useState<Project[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
  const [employeeCache, setEmployeeCache] = useState<Record<string, User>>({})

  // Dialog states
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteAssignmentDialogOpen, setDeleteAssignmentDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)

      // Use optimized query if status filter is active
      const projectsPromise = statusFilter !== 'all'
        ? getProjectsByStatus(statusFilter)
        : getAllProjects()

      const [projectsData, assignmentsData] = await Promise.all([
        projectsPromise,
        getAllAssignments()
      ])

      setProjects(projectsData)
      setAssignments(assignmentsData)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [statusFilter]) // Re-fetch when status filter changes

  const handleCreateProject = () => {
    setSelectedProject(null)
    setProjectDialogOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setProjectDialogOpen(true)
  }

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedProject) return
    await deleteProject(selectedProject.id)
    await fetchData()
  }

  const handleProjectSuccess = async () => {
    await fetchData()
  }

  const toggleProjectExpanded = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const handleEditAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setAssignmentDialogOpen(true)
  }

  const handleDeleteAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setDeleteAssignmentDialogOpen(true)
  }

  const handleAddTeamMember = (projectId: string) => {
    setSelectedProject(projects.find(p => p.id === projectId) || null)
    setSelectedAssignment(null)
    setAssignmentDialogOpen(true)
  }

  const confirmDeleteAssignment = async () => {
    if (!selectedAssignment) return
    await deleteAssignment(selectedAssignment.id)
    await fetchData()
  }

  const handleAssignmentSuccess = async () => {
    await fetchData()
  }

  // Fetch employee data for assignments
  const getEmployeeName = async (employeeId: string): Promise<string> => {
    if (employeeCache[employeeId]) {
      return employeeCache[employeeId].displayName
    }

    try {
      const employee = await getUserById(employeeId)
      if (employee) {
        setEmployeeCache(prev => ({ ...prev, [employeeId]: employee }))
        return employee.displayName
      }
    } catch (error) {
      console.error('Error fetching employee:', error)
    }
    return 'Unknown Employee'
  }

  // Preload employee names for visible assignments
  useEffect(() => {
    const loadEmployeeNames = async () => {
      const employeeIds = new Set(assignments.map(a => a.employeeId))
      for (const employeeId of employeeIds) {
        if (!employeeCache[employeeId]) {
          await getEmployeeName(employeeId)
        }
      }
    }
    if (assignments.length > 0) {
      loadEmployeeNames()
    }
  }, [assignments])

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.client.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'info'
      case 'planning': return 'warning'
      case 'onHold': return 'destructive'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  const statusCounts = {
    all: projects.length,
    planning: projects.filter(p => p.status === 'planning').length,
    active: projects.filter(p => p.status === 'active').length,
    onHold: projects.filter(p => p.status === 'onHold').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your projects and track their progress
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({statusCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({statusCounts.active})
          </Button>
          <Button
            variant={statusFilter === 'planning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('planning')}
          >
            Planning ({statusCounts.planning})
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const projectAssignments = assignments.filter(a => a.projectId === project.id)
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription>{project.client}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{format(project.startDate, 'MMM dd')} - {format(project.endDate, 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{projectAssignments.length} team members</span>
                    </div>
                  </div>

                  <div className="flex gap-1 flex-wrap">
                    {project.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-gray-50 dark:bg-gray-900 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteProject(project)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>

                  {/* Team Members Section */}
                  <div className="border-t pt-3 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => toggleProjectExpanded(project.id)}
                    >
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team ({projectAssignments.length})
                      </span>
                      {expandedProjects.has(project.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedProjects.has(project.id) && (
                      <div className="mt-3 space-y-2">
                        {projectAssignments.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No team members assigned
                          </p>
                        ) : (
                          projectAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {employeeCache[assignment.employeeId]?.displayName || 'Loading...'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {assignment.allocationPercentage}% allocated
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => handleEditAssignment(assignment)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteAssignment(assignment)}
                                >
                                  <UserX className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleAddTeamMember(project.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Team Member
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredProjects.map((project) => {
                const projectAssignments = assignments.filter(a => a.projectId === project.id)
                return (
                  <div key={project.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          <Badge variant={getStatusVariant(project.status)} className="text-xs">
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.client}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(project.startDate, 'MMM dd, yyyy')} - {format(project.endDate, 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {projectAssignments.length} members
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {project.techStack.slice(0, 5).map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Team Members Section */}
                        <div className="border-t pt-3 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => toggleProjectExpanded(project.id)}
                          >
                            <span className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Team ({projectAssignments.length})
                            </span>
                            {expandedProjects.has(project.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>

                          {expandedProjects.has(project.id) && (
                            <div className="mt-3 space-y-2">
                              {projectAssignments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No team members assigned yet
                                </p>
                              ) : (
                                projectAssignments.map((assignment) => (
                                  <div
                                    key={assignment.id}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {employeeCache[assignment.employeeId]?.displayName || 'Loading...'}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {assignment.allocationPercentage}% allocated • Starts {format(assignment.startDate, 'MMM dd, yyyy')}
                                      </p>
                                    </div>
                                    <div className="flex gap-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditAssignment(assignment)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => handleDeleteAssignment(assignment)}
                                      >
                                        <UserX className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleAddTeamMember(project.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Team Member
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProject(project)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        project={selectedProject}
        onSuccess={handleProjectSuccess}
      />

      <AssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        assignment={selectedAssignment}
        preSelectedProjectId={selectedProject?.id}
        onSuccess={handleAssignmentSuccess}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        itemName={selectedProject?.name}
        cascadeInfo={
          selectedProject
            ? (() => {
                const projectAssignments = assignments.filter(a => a.projectId === selectedProject.id)
                return projectAssignments.length > 0
                  ? `This will also delete ${projectAssignments.length} team member assignment${projectAssignments.length > 1 ? 's' : ''}.`
                  : undefined
              })()
            : undefined
        }
        onConfirm={confirmDelete}
      />

      <DeleteConfirmDialog
        open={deleteAssignmentDialogOpen}
        onOpenChange={setDeleteAssignmentDialogOpen}
        title="Remove Team Member"
        description="Are you sure you want to remove this team member from the project?"
        itemName={
          selectedAssignment
            ? `${employeeCache[selectedAssignment.employeeId]?.displayName || 'Team Member'} (${selectedAssignment.allocationPercentage}% allocated)`
            : undefined
        }
        onConfirm={confirmDeleteAssignment}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, FolderKanban, Eye } from 'lucide-react'
import {
  getAssignmentsByEmployee,
  getProjectById,
  getUserById
} from '@/services/firebaseService'
import type { Assignment, Project, User as UserType } from '@/types'
import { format } from 'date-fns'
import { ProjectDetailsDialog } from '@/components/dialogs/ProjectDetailsDialog'

interface ProjectWithAssignment {
  assignment: Assignment
  project: Project
  manager: UserType | null
}

export const MyProjectsPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectWithAssignment[]>([])

  // Project details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return

      try {
        setLoading(true)
        const assignments = await getAssignmentsByEmployee(user.uid)

        const projectsWithDetails = await Promise.all(
          assignments.map(async (assignment) => {
            try {
              const project = await getProjectById(assignment.projectId)
              if (!project) return null

              let manager: UserType | null = null
              if (project.managerId) {
                try {
                  manager = await getUserById(project.managerId)
                } catch (err) {
                  console.error('Error fetching manager:', err)
                }
              }

              return { assignment, project, manager }
            } catch (err) {
              console.error('Error fetching project:', err)
              return null
            }
          })
        )

        setProjects(projectsWithDetails.filter((p): p is ProjectWithAssignment => p !== null))
      } catch (err) {
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'info'
      case 'planning': return 'warning'
      case 'onHold': return 'destructive'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  const activeProjects = projects.filter(p => p.project?.status === 'active' || p.project?.status === 'planning')
  const completedProjects = projects.filter(p => p.project?.status === 'completed')

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setDetailsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Projects</h1>
        <p className="text-muted-foreground mt-2">
          View all your project assignments and track your work
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.map(({ assignment, project, manager }) => {
              if (!project) return null
              return (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
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
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {format(project.startDate, 'MMM dd, yyyy')} - {format(project.endDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>Manager: {manager?.displayName || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Your Allocation</span>
                        <span className="font-semibold">{assignment.allocationPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${assignment.allocationPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-1 flex-wrap">
                      {project.techStack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 4 && (
                        <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                          +{project.techStack.length - 4}
                        </span>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(project)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Projects</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {completedProjects.map(({ assignment, project }) => {
                  if (!project) return null
                  return (
                    <div key={assignment.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{project.name}</h4>
                            <Badge variant={getStatusVariant(project.status)}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{project.client}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Duration: {format(project.startDate, 'MMM yyyy')} - {format(project.endDate, 'MMM yyyy')}</span>
                            <span>Your allocation: {assignment.allocationPercentage}%</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(project)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {projects.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No projects assigned</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You haven't been assigned to any projects yet
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        project={selectedProject}
      />
    </div>
  )
}

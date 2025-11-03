import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Briefcase, User } from 'lucide-react'
import { format } from 'date-fns'
import { getAssignmentsByProject, getUserById } from '@/services/firebaseService'
import type { Project, Assignment, User as UserType } from '@/types'

interface ProjectDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
}

export const ProjectDetailsDialog: React.FC<ProjectDetailsDialogProps> = ({
  open,
  onOpenChange,
  project
}) => {
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [employeeCache, setEmployeeCache] = useState<Record<string, UserType>>({})
  const [projectManager, setProjectManager] = useState<UserType | null>(null)

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!project) return

      try {
        setLoading(true)

        // Fetch assignments for this project
        const projectAssignments = await getAssignmentsByProject(project.id)
        setAssignments(projectAssignments)

        // Fetch employee details for all assignments
        const employeeIds = projectAssignments.map(a => a.employeeId)
        const employees: Record<string, UserType> = {}

        for (const empId of employeeIds) {
          try {
            const emp = await getUserById(empId)
            if (emp) {
              employees[empId] = emp
            }
          } catch (err) {
            console.error(`Error fetching employee ${empId}:`, err)
          }
        }
        setEmployeeCache(employees)

        // Fetch project manager details
        if (project.managerId) {
          try {
            const manager = await getUserById(project.managerId)
            setProjectManager(manager)
          } catch (err) {
            console.error('Error fetching manager:', err)
          }
        }
      } catch (err) {
        console.error('Error fetching project details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (open && project) {
      fetchProjectDetails()
    } else {
      // Reset when closed
      setAssignments([])
      setEmployeeCache({})
      setProjectManager(null)
      setLoading(true)
    }
  }, [open, project])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'planning': return 'warning'
      case 'active': return 'info'
      case 'on-hold': return 'destructive'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{project.name}</DialogTitle>
            <Badge variant={getStatusVariant(project.status)} className="capitalize">
              {project.status}
            </Badge>
          </div>
          <DialogDescription className="text-base">
            {project.client}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Description */}
            {project.description && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            )}

            {/* Project Manager */}
            {projectManager && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Project Manager
                </h3>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {projectManager.displayName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{projectManager.displayName}</p>
                    <p className="text-xs text-muted-foreground">{projectManager.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                  <p className="text-sm font-medium">{format(project.startDate, 'MMM dd, yyyy')}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">End Date</p>
                  <p className="text-sm font-medium">{format(project.endDate, 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members ({assignments.length})
              </h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-md">
                  No team members assigned yet
                </p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((assignment) => {
                    const employee = employeeCache[assignment.employeeId]
                    return (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {employee?.displayName.split(' ').map(n => n[0]).join('') || '?'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">
                              {employee?.displayName || 'Loading...'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {employee?.department || ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-sm font-semibold text-primary">
                            {assignment.allocationPercentage}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            allocated
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FolderKanban,
  Clock,
  TrendingUp,
  Calendar,
  Edit,
  X
} from 'lucide-react'
import {
  getAssignmentsByEmployee,
  getProjectById,
  getEmployeeUtilization,
  updateUser
} from '@/services/firebaseService'
import type { Assignment, Project, AvailabilityStatus } from '@/types'
import { format } from 'date-fns'

export const EmployeeDashboard = () => {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [projects, setProjects] = useState<Record<string, Project>>({})
  const [utilization, setUtilization] = useState(0)

  // Availability dialog state
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false)
  const [selectedAvailability, setSelectedAvailability] = useState<AvailabilityStatus>('available')
  const [updatingAvailability, setUpdatingAvailability] = useState(false)

  // Skills dialog state
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [editedSkills, setEditedSkills] = useState<string[]>([])
  const [updatingSkills, setUpdatingSkills] = useState(false)

  // Fetch employee data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch assignments
        const userAssignments = await getAssignmentsByEmployee(user.uid)
        setAssignments(userAssignments)

        // Fetch projects for assignments
        const projectsMap: Record<string, Project> = {}
        for (const assignment of userAssignments) {
          try {
            const project = await getProjectById(assignment.projectId)
            if (project) {
              projectsMap[project.id] = project
            }
          } catch (err) {
            console.error(`Error fetching project ${assignment.projectId}:`, err)
          }
        }
        setProjects(projectsMap)

        // Fetch utilization
        const userUtilization = await getEmployeeUtilization(user.uid)
        setUtilization(userUtilization)
      } catch (err) {
        console.error('Error fetching employee data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const activeAssignments = assignments.filter(a => {
    const project = projects[a.projectId]
    return project?.status === 'active' || project?.status === 'planning'
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'info'
      case 'planning': return 'warning'
      case 'onHold': return 'destructive'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600'
      case 'partial': return 'text-yellow-600'
      case 'full': return 'text-orange-600'
      case 'onLeave': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Availability handlers
  const handleOpenAvailabilityDialog = () => {
    setSelectedAvailability(user?.availability || 'available')
    setAvailabilityDialogOpen(true)
  }

  const handleUpdateAvailability = async () => {
    if (!user) return

    try {
      setUpdatingAvailability(true)
      await updateUser(user.uid, { availability: selectedAvailability })
      await refreshUser()
      setAvailabilityDialogOpen(false)
    } catch (err) {
      console.error('Error updating availability:', err)
      alert('Failed to update availability. Please try again.')
    } finally {
      setUpdatingAvailability(false)
    }
  }

  // Skills handlers
  const handleOpenSkillsDialog = () => {
    setEditedSkills([...(user?.skills || [])])
    setSkillInput('')
    setSkillsDialogOpen(true)
  }

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim()
    if (trimmedSkill && !editedSkills.includes(trimmedSkill)) {
      setEditedSkills([...editedSkills, trimmedSkill])
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditedSkills(editedSkills.filter(skill => skill !== skillToRemove))
  }

  const handleUpdateSkills = async () => {
    if (!user || editedSkills.length === 0) {
      alert('Please add at least one skill.')
      return
    }

    try {
      setUpdatingSkills(true)
      await updateUser(user.uid, { skills: editedSkills })
      await refreshUser()
      setSkillsDialogOpen(false)
    } catch (err) {
      console.error('Error updating skills:', err)
      alert('Failed to update skills. Please try again.')
    } finally {
      setUpdatingSkills(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.displayName}!</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your current assignments and availability.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Active Projects"
          value={activeAssignments.length}
          icon={FolderKanban}
          description="Currently assigned"
        />
        <StatCard
          title="Total Allocation"
          value={`${utilization}%`}
          icon={Clock}
          description="Current workload"
        />
        <StatCard
          title="Availability"
          value={user?.availability || 'Unknown'}
          icon={TrendingUp}
          description="Current status"
          className="capitalize"
        />
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Your information and skills</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="text-sm">{user?.department}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-muted-foreground">Availability Status</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenAvailabilityDialog}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
                <p className={`text-sm font-semibold capitalize ${getAvailabilityColor(user?.availability || '')}`}>
                  {user?.availability}
                </p>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Skills</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenSkillsDialog}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Current Assignments</CardTitle>
          <CardDescription>Projects you're currently working on</CardDescription>
        </CardHeader>
        <CardContent>
          {activeAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Active Assignments</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You don't have any active project assignments at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAssignments.map((assignment) => {
                const project = projects[assignment.projectId]
                if (!project) return null

                return (
                  <div
                    key={assignment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{project.name}</h4>
                          <Badge variant={getStatusVariant(project.status)}>
                            {project.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project.client}
                        </p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(project.startDate, 'MMM dd, yyyy')} - {format(project.endDate, 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started: {format(assignment.startDate, 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-primary">
                          {assignment.allocationPercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground">Allocation</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Dialog */}
      <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Availability</DialogTitle>
            <DialogDescription>
              Change your current availability status to help managers with resource planning.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="availability">
                Availability Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedAvailability}
                onValueChange={(value) => setSelectedAvailability(value as AvailabilityStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="partial">Partially Available</SelectItem>
                  <SelectItem value="full">Fully Allocated</SelectItem>
                  <SelectItem value="onLeave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This helps managers know your current capacity for new projects.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvailabilityDialogOpen(false)}
              disabled={updatingAvailability}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAvailability} disabled={updatingAvailability}>
              {updatingAvailability ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Availability'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Skills Dialog */}
      <Dialog open={skillsDialogOpen} onOpenChange={setSkillsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Skills</DialogTitle>
            <DialogDescription>
              Add or remove skills to showcase your expertise.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skill-input">Add Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="skill-input"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSkill()
                    }
                  }}
                  placeholder="e.g., React, Python, Design"
                />
                <Button onClick={handleAddSkill} type="button">Add</Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Current Skills</Label>
              <div className="flex flex-wrap gap-2 min-h-[100px] p-3 border rounded-md">
                {editedSkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No skills added yet</p>
                ) : (
                  editedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                    >
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setSkillsDialogOpen(false)}
              disabled={updatingSkills}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSkills} disabled={updatingSkills}>
              {updatingSkills ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Skills'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

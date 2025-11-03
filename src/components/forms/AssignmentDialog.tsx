import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAssignment, updateAssignment, getUsersByRole, getAllProjects } from '@/services/firebaseService'
import type { Assignment, User, Project } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface AssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment?: Assignment | null
  preSelectedEmployeeId?: string
  preSelectedProjectId?: string
  onSuccess?: () => void
}

export const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onOpenChange,
  assignment,
  preSelectedEmployeeId,
  preSelectedProjectId,
  onSuccess
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [formData, setFormData] = useState({
    employeeId: '',
    projectId: '',
    allocationPercentage: '',
    startDate: ''
  })

  // Fetch employees and projects - and populate form after data loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        setError(null)

        const [employeesData, projectsData] = await Promise.all([
          getUsersByRole('employee'),
          getAllProjects()
        ])

        setEmployees(employeesData)
        setProjects(projectsData)
        setLoadingData(false)

        // Populate form immediately after data is loaded
        if (assignment) {
          setFormData({
            employeeId: assignment.employeeId,
            projectId: assignment.projectId,
            allocationPercentage: assignment.allocationPercentage.toString(),
            startDate: assignment.startDate.toISOString().split('T')[0]
          })
        } else {
          // Reset form for new assignment with preselected values
          setFormData({
            employeeId: preSelectedEmployeeId || '',
            projectId: preSelectedProjectId || '',
            allocationPercentage: '',
            startDate: new Date().toISOString().split('T')[0]
          })
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load employees and projects')
        setLoadingData(false)
      }
    }

    if (open) {
      fetchData()
    } else {
      // Reset when dialog closes
      setEmployees([])
      setProjects([])
      setFormData({
        employeeId: '',
        projectId: '',
        allocationPercentage: '',
        startDate: ''
      })
    }
  }, [open, assignment, preSelectedEmployeeId, preSelectedProjectId])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('You must be logged in')
      return
    }

    // Validation
    if (!formData.employeeId) {
      setError('Please select an employee')
      return
    }
    if (!formData.projectId) {
      setError('Please select a project')
      return
    }
    if (!formData.allocationPercentage) {
      setError('Allocation percentage is required')
      return
    }

    const allocation = parseInt(formData.allocationPercentage)
    if (isNaN(allocation) || allocation < 1 || allocation > 100) {
      setError('Allocation must be between 1 and 100')
      return
    }

    if (!formData.startDate) {
      setError('Start date is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const assignmentData = {
        employeeId: formData.employeeId,
        projectId: formData.projectId,
        allocationPercentage: allocation,
        startDate: new Date(formData.startDate),
        assignedBy: user.uid
      }

      if (assignment) {
        // Update existing assignment
        await updateAssignment(assignment.id, assignmentData)
      } else {
        // Create new assignment
        await createAssignment(assignmentData)
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error saving assignment:', err)
      setError(err instanceof Error ? err.message : 'Failed to save assignment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit Assignment' : 'Assign Employee to Project'}</DialogTitle>
          <DialogDescription>
            {assignment ? 'Update the assignment details below.' : 'Select an employee and project to create an assignment.'}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="employeeId">
                  Employee <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => handleChange('employeeId', value)}
                  disabled={!!preSelectedEmployeeId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No employees available
                      </div>
                    ) : (
                      employees.map((emp) => (
                        <SelectItem key={emp.uid} value={emp.uid}>
                          {emp.displayName} ({emp.department})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {preSelectedEmployeeId && (
                  <p className="text-xs text-muted-foreground">
                    Employee pre-selected from Resources page
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="projectId">
                  Project <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(value) => handleChange('projectId', value)}
                  disabled={!!preSelectedProjectId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        No projects available
                      </div>
                    ) : (
                      projects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          {proj.name} ({proj.client})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {preSelectedProjectId && (
                  <p className="text-xs text-muted-foreground">Project pre-selected from Projects page</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="allocationPercentage">
                  Allocation Percentage (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="allocationPercentage"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.allocationPercentage}
                  onChange={(e) => handleChange('allocationPercentage', e.target.value)}
                  placeholder="50"
                  required
                />
                <p className="text-xs text-muted-foreground">Enter a value between 1 and 100</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                    {assignment ? 'Updating...' : 'Assigning...'}
                  </>
                ) : (
                  assignment ? 'Update Assignment' : 'Create Assignment'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

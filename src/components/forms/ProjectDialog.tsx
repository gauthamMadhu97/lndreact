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
import { Textarea } from '@/components/ui/textarea'
import { createProject, updateProject } from '@/services/firebaseService'
import type { Project, ProjectStatus } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface ProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: Project | null
  onSuccess?: () => void
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  open,
  onOpenChange,
  project,
  onSuccess
}) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    status: 'planning' as ProjectStatus,
    startDate: '',
    endDate: '',
    techStack: ''
  })

  // Populate form when editing
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        client: project.client,
        status: project.status,
        startDate: project.startDate.toISOString().split('T')[0],
        endDate: project.endDate.toISOString().split('T')[0],
        techStack: project.techStack.join(', ')
      })
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        client: '',
        status: 'planning',
        startDate: '',
        endDate: '',
        techStack: ''
      })
    }
    setError(null)
  }, [project, open])

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
    if (!formData.name.trim()) {
      setError('Project name is required')
      return
    }
    if (!formData.client.trim()) {
      setError('Client name is required')
      return
    }
    if (!formData.startDate) {
      setError('Start date is required')
      return
    }
    if (!formData.endDate) {
      setError('End date is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const techStackArray = formData.techStack
        .split(',')
        .map(tech => tech.trim())
        .filter(Boolean)

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        client: formData.client.trim(),
        status: formData.status,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        techStack: techStackArray,
        managerId: user.uid
      }

      if (project) {
        // Update existing project
        await updateProject(project.id, projectData)
      } else {
        // Create new project
        await createProject(projectData)
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Error saving project:', err)
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          <DialogDescription>
            {project ? 'Update the project details below.' : 'Fill in the details to create a new project.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="E-commerce Platform"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="client">
                Client <span className="text-red-500">*</span>
              </Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => handleChange('client', e.target.value)}
                placeholder="TechCorp"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the project objectives and scope..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.status} onValueChange={(value: ProjectStatus) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="onHold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="grid gap-2">
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="techStack">Tech Stack</Label>
              <Input
                id="techStack"
                value={formData.techStack}
                onChange={(e) => handleChange('techStack', e.target.value)}
                placeholder="React, TypeScript, Node.js (comma-separated)"
              />
              <p className="text-xs text-muted-foreground">Separate technologies with commas</p>
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
                  {project ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                project ? 'Update Project' : 'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

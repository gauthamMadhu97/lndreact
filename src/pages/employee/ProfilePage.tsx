import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { User, Mail, Briefcase, Award, Calendar, Edit, X } from 'lucide-react'
import { getEmployeeUtilization, updateUser } from '@/services/firebaseService'
import { format } from 'date-fns'
import type { AvailabilityStatus } from '@/types'

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth()
  const [utilization, setUtilization] = useState(0)
  const [loading, setLoading] = useState(true)

  // Skills dialog state
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [editedSkills, setEditedSkills] = useState<string[]>([])
  const [updatingSkills, setUpdatingSkills] = useState(false)

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityStatus>('available')
  const [updatingAvailability, setUpdatingAvailability] = useState(false)

  useEffect(() => {
    const fetchUtilization = async () => {
      if (!user) return

      try {
        setLoading(true)
        const userUtilization = await getEmployeeUtilization(user.uid)
        setUtilization(userUtilization)
        setAvailability(user.availability)
      } catch (err) {
        console.error('Error fetching utilization:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUtilization()
  }, [user])

  if (!user) return null

  const availabilityOptions: { value: AvailabilityStatus; label: string; description: string; color: string }[] = [
    {
      value: 'available',
      label: 'Available',
      description: 'Ready for new assignments',
      color: 'bg-green-500'
    },
    {
      value: 'partial',
      label: 'Partially Available',
      description: 'Can take on some work',
      color: 'bg-yellow-500'
    },
    {
      value: 'full',
      label: 'Fully Allocated',
      description: 'At capacity',
      color: 'bg-orange-500'
    },
    {
      value: 'onLeave',
      label: 'On Leave',
      description: 'Not available',
      color: 'bg-red-500'
    }
  ]

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

  // Availability handler
  const handleUpdateAvailability = async (newAvailability: AvailabilityStatus) => {
    if (!user || newAvailability === user.availability) return

    try {
      setUpdatingAvailability(true)
      setAvailability(newAvailability)
      await updateUser(user.uid, { availability: newAvailability })
      await refreshUser()
    } catch (err) {
      console.error('Error updating availability:', err)
      setAvailability(user.availability)
      alert('Failed to update availability. Please try again.')
    } finally {
      setUpdatingAvailability(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information and availability
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-semibold text-primary">
                  {user.displayName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">{user.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user.role === 'manager' ? 'Manager' : 'Employee'}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="text-sm">{user.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  Department
                </div>
                <p className="text-sm">{user.department}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <User className="h-4 w-4" />
                  Role
                </div>
                <p className="text-sm capitalize">{user.role}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Joined
                </div>
                <p className="text-sm">{format(user.createdAt, 'MMM dd, yyyy')}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Award className="h-4 w-4" />
                  Skills
                </div>
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
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Utilization Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>Your workload and availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-bold text-2xl">{utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${utilization < 70 ? 'bg-green-500' :
                          utilization < 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${utilization > 100 ? 100 : utilization}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {utilization < 70 ? 'Available for more work' :
                      utilization < 90 ? 'Near capacity' : 'Fully allocated'}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm font-medium">Availability Status</p>
                  <Badge
                    variant={
                      availability === 'available' ? 'success' :
                        availability === 'partial' ? 'warning' :
                          availability === 'full' ? 'info' : 'destructive'
                    }
                    className="capitalize"
                  >
                    {availability}
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Update Availability</CardTitle>
          <CardDescription>
            Let your manager know your current availability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {availabilityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleUpdateAvailability(option.value)}
                disabled={updatingAvailability}
                className={`relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${availability === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-3 w-3 rounded-full ${option.color} mt-1`} />
                  <div className="space-y-1 flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                {availability === option.value && (
                  <div className="absolute top-2 right-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {updatingAvailability && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Updating availability...
            </div>
          )}
        </CardContent>
      </Card>

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

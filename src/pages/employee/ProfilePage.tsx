import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Briefcase, Award, Calendar } from 'lucide-react'
import { getEmployeeUtilization } from '@/data/mockData'
import { format } from 'date-fns'
import { AvailabilityStatus } from '@/types'

export const ProfilePage = () => {
  const { user } = useAuth()
  const [availability, setAvailability] = useState<AvailabilityStatus>(user?.availability || 'available')

  if (!user) return null

  const utilization = getEmployeeUtilization(user.uid)

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
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Award className="h-4 w-4" />
                Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Edit Skills
              </Button>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Utilization</span>
                <span className="font-bold text-2xl">{utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    utilization < 70 ? 'bg-green-500' :
                    utilization < 90 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${utilization}%` }}
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
                onClick={() => setAvailability(option.value)}
                className={`relative rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                  availability === option.value
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
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Page placeholder */}
      {user.role === 'employee' && (
        <Card>
          <CardHeader>
            <CardTitle>Work History</CardTitle>
            <CardDescription>Your completed projects and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Your work history will appear here</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

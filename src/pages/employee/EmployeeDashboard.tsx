import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FolderKanban,
  Clock,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react'
import {
  getAssignmentsByEmployee,
  getProjectById,
  getUserById,
  getEmployeeUtilization
} from '@/data/mockData'
import { format } from 'date-fns'

export const EmployeeDashboard = () => {
  const { user } = useAuth()

  const stats = useMemo(() => {
    if (!user) return { assignments: [], utilization: 0, activeProjects: 0 }

    const userAssignments = getAssignmentsByEmployee(user.uid)
    const activeAssignments = userAssignments.filter(a => {
      const project = getProjectById(a.projectId)
      return project?.status === 'active' || project?.status === 'planning'
    })

    return {
      assignments: userAssignments,
      activeAssignments,
      utilization: getEmployeeUtilization(user.uid),
      activeProjects: activeAssignments.length
    }
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

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600'
      case 'partial': return 'text-yellow-600'
      case 'full': return 'text-orange-600'
      case 'onLeave': return 'text-red-600'
      default: return 'text-gray-600'
    }
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
          value={stats.activeProjects}
          icon={FolderKanban}
          description="Currently assigned"
        />
        <StatCard
          title="Total Allocation"
          value={`${stats.utilization}%`}
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
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Your information and skills</CardDescription>
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
                <p className="text-sm font-medium text-muted-foreground">Availability Status</p>
                <p className={`text-sm font-semibold capitalize ${getAvailabilityColor(user?.availability || '')}`}>
                  {user?.availability}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
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
          {!stats.activeAssignments || stats.activeAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No Active Assignments</h3>
              <p className="text-sm text-muted-foreground mt-2">
                You don't have any active project assignments at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.activeAssignments?.map((assignment) => {
                const project = getProjectById(assignment.projectId)
                const manager = getUserById(project?.managerId || '')
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
                          {project.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(project.startDate, 'MMM dd, yyyy')} - {format(project.endDate, 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Manager: {manager?.displayName || 'Unknown'}
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">Update Availability</CardTitle>
            <CardDescription>Change your current availability status</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Manage Availability</Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-lg">View All Projects</CardTitle>
            <CardDescription>See complete list of your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">Go to Projects</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

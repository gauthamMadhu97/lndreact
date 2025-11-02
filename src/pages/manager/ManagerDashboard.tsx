import { useMemo } from 'react'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FolderKanban,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
  Calendar
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { mockProjects, mockUsers, mockAssignments, getEmployeeUtilization } from '@/data/mockData'
import { format } from 'date-fns'

export const ManagerDashboard = () => {
  // Calculate stats
  const stats = useMemo(() => {
    const employees = mockUsers.filter(u => u.role === 'employee')
    const activeProjects = mockProjects.filter(p => p.status === 'active').length

    // Calculate average utilization
    const totalUtilization = employees.reduce((sum, emp) => {
      return sum + getEmployeeUtilization(emp.uid)
    }, 0)
    const avgUtilization = Math.round(totalUtilization / employees.length)

    // Calculate projects by status
    const projectsByStatus = {
      planning: mockProjects.filter(p => p.status === 'planning').length,
      active: mockProjects.filter(p => p.status === 'active').length,
      onHold: mockProjects.filter(p => p.status === 'onHold').length,
      completed: mockProjects.filter(p => p.status === 'completed').length,
    }

    return {
      totalProjects: mockProjects.length,
      activeProjects,
      totalEmployees: employees.length,
      avgUtilization,
      projectsByStatus
    }
  }, [])

  // Data for charts
  const projectStatusData = [
    { name: 'Planning', value: stats.projectsByStatus.planning, color: '#f59e0b' },
    { name: 'Active', value: stats.projectsByStatus.active, color: '#3b82f6' },
    { name: 'On Hold', value: stats.projectsByStatus.onHold, color: '#ef4444' },
    { name: 'Completed', value: stats.projectsByStatus.completed, color: '#10b981' },
  ]

  const utilizationData = mockUsers
    .filter(u => u.role === 'employee')
    .slice(0, 6)
    .map(emp => ({
      name: emp.displayName.split(' ')[0],
      utilization: getEmployeeUtilization(emp.uid)
    }))

  // Get recent/active projects
  const recentProjects = mockProjects
    .filter(p => p.status === 'active' || p.status === 'planning')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'info'
      case 'planning': return 'warning'
      case 'onHold': return 'destructive'
      case 'completed': return 'success'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your team and projects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FolderKanban}
          description={`${stats.activeProjects} active`}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={TrendingUp}
          description="Currently in progress"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Team Members"
          value={stats.totalEmployees}
          icon={Users}
          description="Available employees"
        />
        <StatCard
          title="Avg Utilization"
          value={`${stats.avgUtilization}%`}
          icon={Clock}
          description="Team capacity used"
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Distribution across all project statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Team Utilization</CardTitle>
            <CardDescription>Current allocation across team members</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recent and active projects</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => {
              const assignments = mockAssignments.filter(a => a.projectId === project.id)
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{project.name}</h4>
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.client}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(project.startDate, 'MMM dd, yyyy')} - {format(project.endDate, 'MMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignments.length} members
                      </span>
                    </div>
                    <div className="flex gap-1 flex-wrap mt-2">
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
                          +{project.techStack.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-4">
                    View Details
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

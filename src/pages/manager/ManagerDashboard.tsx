import { useMemo, useState, useEffect } from 'react'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FolderKanban,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  Eye
} from 'lucide-react'
import { ProjectDetailsDialog } from '@/components/dialogs/ProjectDetailsDialog'
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
import {
  getAllProjects,
  getUsersByRole,
  getAllAssignments,
  getEmployeeUtilization
} from '@/services/firebaseService'
import type { Project, User, Assignment } from '@/types'
import { format } from 'date-fns'

export const ManagerDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [employees, setEmployees] = useState<User[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [utilizationMap, setUtilizationMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Project details dialog state
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all data in parallel
        const [projectsData, employeesData, assignmentsData] = await Promise.all([
          getAllProjects(),
          getUsersByRole('employee'),
          getAllAssignments()
        ])

        setProjects(projectsData)
        setEmployees(employeesData)
        setAssignments(assignmentsData)

        // Calculate utilization for each employee
        const utilizations: Record<string, number> = {}
        for (const emp of employeesData) {
          utilizations[emp.uid] = await getEmployeeUtilization(emp.uid)
        }
        setUtilizationMap(utilizations)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'active').length

    // Calculate average utilization
    const totalUtilization = Object.values(utilizationMap).reduce((sum, util) => sum + util, 0)
    const avgUtilization = employees.length > 0 ? Math.round(totalUtilization / employees.length) : 0

    // Calculate projects by status
    const projectsByStatus = {
      planning: projects.filter(p => p.status === 'planning').length,
      active: projects.filter(p => p.status === 'active').length,
      onHold: projects.filter(p => p.status === 'onHold').length,
      completed: projects.filter(p => p.status === 'completed').length,
    }

    return {
      totalProjects: projects.length,
      activeProjects,
      totalEmployees: employees.length,
      avgUtilization,
      projectsByStatus
    }
  }, [projects, employees, utilizationMap])

  // Data for charts
  const projectStatusData = [
    { name: 'Planning', value: stats.projectsByStatus.planning, color: '#f59e0b' },
    { name: 'Active', value: stats.projectsByStatus.active, color: '#3b82f6' },
    { name: 'On Hold', value: stats.projectsByStatus.onHold, color: '#ef4444' },
    { name: 'Completed', value: stats.projectsByStatus.completed, color: '#10b981' },
  ]

  const utilizationData = employees
    .slice(0, 6)
    .map(emp => ({
      name: emp.displayName.split(' ')[0],
      utilization: utilizationMap[emp.uid] || 0
    }))

  // Get recent/active projects
  const recentProjects = projects
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

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setDetailsDialogOpen(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
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
                  data={projectStatusData.filter(entry => entry.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.filter(entry => entry.value > 0).map((entry, index) => (
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No active or planning projects yet.</p>
                <p className="text-sm mt-2">Create your first project to get started!</p>
              </div>
            ) : (
              recentProjects.map((project) => {
                const projectAssignments = assignments.filter(a => a.projectId === project.id)
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
                          {projectAssignments.length} members
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4"
                      onClick={() => handleViewDetails(project)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        project={selectedProject}
      />
    </div>
  )
}

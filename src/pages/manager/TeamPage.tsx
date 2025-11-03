import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUsersByRole, getEmployeeUtilization, getAllProjects } from '@/services/firebaseService'
import type { User, Project } from '@/types'
import { Users, Award } from 'lucide-react'

export const TeamPage = () => {
  const [employees, setEmployees] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [utilizationMap, setUtilizationMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesData, projectsData] = await Promise.all([
          getUsersByRole('employee'),
          getAllProjects()
        ])
        setEmployees(employeesData)
        setProjects(projectsData)

        const utilizations: Record<string, number> = {}
        for (const emp of employeesData) {
          utilizations[emp.uid] = await getEmployeeUtilization(emp.uid)
        }
        setUtilizationMap(utilizations)
      } catch (error) {
        console.error('Error fetching team data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const departments = [...new Set(employees.map(e => e.department))]

  const getUtilizationStats = () => {
    const utils = Object.values(utilizationMap)
    const available = utils.filter(u => u < 70).length
    const nearCapacity = utils.filter(u => u >= 70 && u < 90).length
    const fullCapacity = utils.filter(u => u >= 90).length
    return { available, nearCapacity, fullCapacity }
  }

  const stats = getUtilizationStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Team Overview</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your team's capacity and skills
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Near Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.nearCapacity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Full Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.fullCapacity}</div>
          </CardContent>
        </Card>
      </div>

      {/* By Department */}
      <Card>
        <CardHeader>
          <CardTitle>Team by Department</CardTitle>
          <CardDescription>Distribution of team members across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map(dept => {
              const deptEmployees = employees.filter(e => e.department === dept)
              const avgUtil = Math.round(
                deptEmployees.reduce((sum, e) => sum + (utilizationMap[e.uid] || 0), 0) / deptEmployees.length
              )
              return (
                <div key={dept} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{dept}</h4>
                        <p className="text-sm text-muted-foreground">
                          {deptEmployees.length} members • Avg {avgUtil}% utilization
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-3">
                    {deptEmployees.map(emp => {
                      const util = utilizationMap[emp.uid] || 0
                      return (
                        <div
                          key={emp.uid}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-semibold text-primary">
                                {emp.displayName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-sm font-medium truncate">{emp.displayName}</span>
                          </div>
                          <Badge
                            variant={util < 70 ? 'success' : util < 90 ? 'warning' : 'destructive'}
                            className="ml-2 flex-shrink-0"
                          >
                            {util}%
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Skills Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Distribution</CardTitle>
          <CardDescription>Overview of skills across the team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              const skillCounts: Record<string, number> = {}
              employees.forEach(emp => {
                emp.skills.forEach(skill => {
                  skillCounts[skill] = (skillCounts[skill] || 0) + 1
                })
              })
              const sortedSkills = Object.entries(skillCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)

              return sortedSkills.map(([skill, count]) => (
                <div key={skill} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="font-medium">{skill}</span>
                    </div>
                    <span className="text-muted-foreground">{count} members</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${(count / employees.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Project Workload */}
      <Card>
        <CardHeader>
          <CardTitle>Active Projects</CardTitle>
          <CardDescription>Current projects and their team sizes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projects
              .filter(p => p.status === 'active')
              .map(project => {
                const activeEmployees = employees
                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{activeEmployees.length} members</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

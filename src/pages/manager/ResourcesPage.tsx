import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, Mail, Briefcase } from 'lucide-react'
import { mockUsers, getEmployeeUtilization } from '@/data/mockData'
import type { AvailabilityStatus } from '@/types'

export const ResourcesPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityStatus | 'all'>('all')

  const employees = mockUsers.filter(u => u.role === 'employee')

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.department.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesAvailability = availabilityFilter === 'all' || emp.availability === availabilityFilter
      return matchesSearch && matchesAvailability
    })
  }, [employees, searchQuery, availabilityFilter])

  const getUtilizationColor = (utilization: number) => {
    if (utilization === 0) return 'bg-gray-500'
    if (utilization < 70) return 'bg-green-500'
    if (utilization < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getAvailabilityVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'partial': return 'warning'
      case 'full': return 'info'
      case 'onLeave': return 'destructive'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and their availability
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={availabilityFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvailabilityFilter('all')}
          >
            All
          </Button>
          <Button
            variant={availabilityFilter === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvailabilityFilter('available')}
          >
            Available
          </Button>
          <Button
            variant={availabilityFilter === 'partial' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvailabilityFilter('partial')}
          >
            Partial
          </Button>
          <Button
            variant={availabilityFilter === 'full' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAvailabilityFilter('full')}
          >
            Fully Allocated
          </Button>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => {
          const utilization = getEmployeeUtilization(employee.uid)
          return (
            <Card key={employee.uid} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {employee.displayName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-base">{employee.displayName}</CardTitle>
                      <CardDescription className="text-xs">{employee.department}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={getAvailabilityVariant(employee.availability)} className="capitalize">
                    {employee.availability}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    <span>{employee.department}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="font-semibold">{utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getUtilizationColor(utilization)}`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {employee.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                    {employee.skills.length > 3 && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                        +{employee.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Assign
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No employees found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

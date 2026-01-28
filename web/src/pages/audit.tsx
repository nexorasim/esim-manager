import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Shield, Search, Filter, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { auditService, AuditLog } from '../services/audit-service'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')

  useEffect(() => {
    loadLogs()
  }, [currentPage, actionFilter, severityFilter])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const result = await auditService.getAuditLogs({
        page: currentPage,
        limit: 20,
        action: actionFilter || undefined,
        severity: severityFilter || undefined
      })
      setLogs(result.logs)
      setTotal(result.total)
      setPages(result.pages)
    } catch (error) {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-destructive" />
      case 'error': return <XCircle className="w-4 h-4 text-error" />
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />
      case 'info': return <Info className="w-4 h-4 text-info" />
      default: return <CheckCircle className="w-4 h-4 text-success" />
    }
  }

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'badge-error',
      error: 'badge-error',
      warning: 'badge-warning',
      info: 'badge-info'
    }
    return styles[severity] || 'badge-success'
  }

  const formatAction = (action: string) => {
    return action.replace('.', ' ').replace('_', ' ')
  }

  return (
    <>
      <Head>
        <title>Audit Logs | NexoraSIM</title>
      </Head>

      <div className="space-y-6 animate-fade-in" data-testid="audit-page">
        {/* Header */}
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Monitor system activity and security events</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by action..."
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setCurrentPage(1); }}
              className="input-field pl-10"
              data-testid="audit-action-filter"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="input-field pl-10 pr-10 appearance-none cursor-pointer min-w-[150px]"
              data-testid="audit-severity-filter"
            >
              <option value="">All Severity</option>
              <option value="critical">Critical</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        {/* Logs table */}
        {loading ? (
          <div className="card">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-4 h-4 bg-muted rounded" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="card text-center py-12" data-testid="no-logs-message">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              No audit logs found
            </h3>
            <p className="text-muted-foreground">
              {actionFilter || severityFilter ? 'Try adjusting your filters' : 'Audit logs will appear here'}
            </p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Action</th>
                    <th>User</th>
                    <th>Resource</th>
                    <th>IP Address</th>
                    <th>Timestamp</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log._id || index} data-testid={`audit-log-row-${index}`}>
                      <td>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(log.severity)}
                          <span className={`badge ${getSeverityBadge(log.severity)}`}>
                            {log.severity}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="capitalize">{formatAction(log.action)}</span>
                      </td>
                      <td>
                        <span className="text-muted-foreground">{log.userEmail || '-'}</span>
                      </td>
                      <td>
                        {log.resourceType && (
                          <span className="font-mono text-xs">
                            {log.resourceType}:{log.resourceId?.substring(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.ipAddress || '-'}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted-foreground">
                          {format(new Date(log.timestamp), 'MMM d, HH:mm:ss')}
                        </span>
                      </td>
                      <td>
                        {log.success ? (
                          <span className="badge badge-success">Success</span>
                        ) : (
                          <span className="badge badge-error">Failed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} entries
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary py-2 px-4 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {pages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
                    disabled={currentPage === pages}
                    className="btn-secondary py-2 px-4 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

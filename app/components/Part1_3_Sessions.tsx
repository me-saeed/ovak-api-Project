'use client'

import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function Part1_3_Sessions() {
  const [sessionsResult, setSessionsResult] = useState<any>(null)
  const [deleteResult, setDeleteResult] = useState<any>(null)
  const [loading, setLoading] = useState({ get: false, delete: false })
  const [sessionIdToDelete, setSessionIdToDelete] = useState('')

  const handleGetSessions = async () => {
    setLoading({ ...loading, get: true })
    setSessionsResult(null)

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      setSessionsResult({
        status: 'Error',
        data: { error: 'No access token found. Please login first.' },
        success: false,
      })
      setLoading({ ...loading, get: false })
      return
    }

    try {
      const response = await apiClient.get('/auth/sessions')
      setSessionsResult({
        status: response.status,
        data: response.data,
        success: true,
      })
    } catch (error: any) {
      setSessionsResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, get: false })
    }
  }

  const handleDeleteSession = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ ...loading, delete: true })
    setDeleteResult(null)

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      setDeleteResult({
        status: 'Error',
        data: { error: 'No access token found. Please login first.' },
        success: false,
      })
      setLoading({ ...loading, delete: false })
      return
    }

    try {
      const response = await apiClient.delete('/auth/sessions', {
        data: { session_id: sessionIdToDelete },
      })
      setDeleteResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      setSessionIdToDelete('')
    } catch (error: any) {
      setDeleteResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, delete: false })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Part 1.3: Session Management</h2>
        <p className="text-gray-600 text-sm mb-4">
          Test getting all sessions and revoking sessions. Requires login from Part 1.1.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Get Sessions */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">GET /auth/sessions</h3>
          <button
            onClick={handleGetSessions}
            disabled={loading.get}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.get ? 'Loading...' : 'Get All Sessions'}
          </button>

          {sessionsResult && (
            <div className={`mt-4 p-3 rounded ${sessionsResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {sessionsResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(sessionsResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Delete Session */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">DELETE /auth/sessions</h3>
          <form onSubmit={handleDeleteSession} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session ID (optional - leave empty to delete all)
              </label>
              <input
                type="text"
                value={sessionIdToDelete}
                onChange={(e) => setSessionIdToDelete(e.target.value)}
                placeholder="Leave empty to revoke all sessions"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading.delete}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {loading.delete ? 'Deleting...' : 'Revoke Session(s)'}
            </button>
          </form>

          {deleteResult && (
            <div className={`mt-4 p-3 rounded ${deleteResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {deleteResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(deleteResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Testing Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Get sessions first to see all active sessions</li>
          <li>Try deleting a specific session by ID</li>
          <li>Try deleting all sessions (leave ID empty)</li>
          <li>After deleting all sessions, you&apos;ll need to login again</li>
        </ul>
      </div>
    </div>
  )
}



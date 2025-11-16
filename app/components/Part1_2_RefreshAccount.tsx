'use client'

import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function Part1_2_RefreshAccount() {
  const [refreshResult, setRefreshResult] = useState<any>(null)
  const [accountResult, setAccountResult] = useState<any>(null)
  const [loading, setLoading] = useState({ refresh: false, account: false })

  const handleRefresh = async () => {
    setLoading({ ...loading, refresh: true })
    setRefreshResult(null)

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      setRefreshResult({
        status: 'Error',
        data: { error: 'No refresh token found. Please login first.' },
        success: false,
      })
      setLoading({ ...loading, refresh: false })
      return
    }

    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      })
      setRefreshResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      // Update tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
    } catch (error: any) {
      setRefreshResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, refresh: false })
    }
  }

  const handleGetAccount = async () => {
    setLoading({ ...loading, account: true })
    setAccountResult(null)

    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) {
      setAccountResult({
        status: 'Error',
        data: { error: 'No access token found. Please login first.' },
        success: false,
      })
      setLoading({ ...loading, account: false })
      return
    }

    try {
      const response = await apiClient.get('/auth/account')
      setAccountResult({
        status: response.status,
        data: response.data,
        success: true,
      })
    } catch (error: any) {
      setAccountResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, account: false })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Part 1.2: Refresh Token & Account Info</h2>
        <p className="text-gray-600 text-sm mb-4">
          Test token refresh and retrieving account information. Requires login from Part 1.1.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Refresh Token */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /auth/refresh</h3>
          <button
            onClick={handleRefresh}
            disabled={loading.refresh}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.refresh ? 'Refreshing...' : 'Refresh Token'}
          </button>

          {refreshResult && (
            <div className={`mt-4 p-3 rounded ${refreshResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {refreshResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(refreshResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Get Account */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">GET /auth/account</h3>
          <button
            onClick={handleGetAccount}
            disabled={loading.account}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.account ? 'Loading...' : 'Get Account Info'}
          </button>

          {accountResult && (
            <div className={`mt-4 p-3 rounded ${accountResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {accountResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(accountResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Token Status */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">Current Token Status:</h4>
        <div className="text-sm space-y-1">
          <div>
            Access Token: {localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing'}
          </div>
          <div>
            Refresh Token: {localStorage.getItem('refresh_token') ? '✅ Present' : '❌ Missing'}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Testing Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Make sure you&apos;ve logged in from Part 1.1 first</li>
          <li>Refresh token should return a new access token</li>
          <li>Account info should return your user details</li>
          <li>Test with expired tokens to see error handling</li>
        </ul>
      </div>
    </div>
  )
}



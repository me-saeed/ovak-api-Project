'use client'

import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function Part1_4_Practitioner() {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [mfaData, setMfaData] = useState({
    code: '',
  })
  const [loginResult, setLoginResult] = useState<any>(null)
  const [exchangeResult, setExchangeResult] = useState<any>(null)
  const [mfaResult, setMfaResult] = useState<any>(null)
  const [loading, setLoading] = useState({ login: false, exchange: false, mfa: false })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ ...loading, login: true })
    setLoginResult(null)

    try {
      const response = await apiClient.post('/tenant/practitioner/login', loginData)
      setLoginResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      // Save tokens if provided
      if (response.data.access_token) {
        localStorage.setItem('practitioner_access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('practitioner_refresh_token', response.data.refresh_token)
      }
    } catch (error: any) {
      setLoginResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, login: false })
    }
  }

  const handleExchangeToken = async () => {
    setLoading({ ...loading, exchange: true })
    setExchangeResult(null)

    const token = localStorage.getItem('practitioner_access_token')
    if (!token) {
      setExchangeResult({
        status: 'Error',
        data: { error: 'No practitioner token found. Please login first.' },
        success: false,
      })
      setLoading({ ...loading, exchange: false })
      return
    }

    try {
      const response = await apiClient.post('/tenant/practitioner/exchange-token', {
        token: token,
      })
      setExchangeResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      if (response.data.access_token) {
        localStorage.setItem('practitioner_access_token', response.data.access_token)
      }
    } catch (error: any) {
      setExchangeResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, exchange: false })
    }
  }

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ ...loading, mfa: true })
    setMfaResult(null)

    try {
      const response = await apiClient.post('/tenant/practitioner/mfa', {
        ...mfaData,
        token: localStorage.getItem('practitioner_access_token'),
      })
      setMfaResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      if (response.data.access_token) {
        localStorage.setItem('practitioner_access_token', response.data.access_token)
      }
    } catch (error: any) {
      setMfaResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, mfa: false })
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Part 1.4: Practitioner Authentication</h2>
        <p className="text-gray-600 text-sm mb-4">
          Test practitioner-specific authentication endpoints. These are for healthcare providers.
        </p>
      </div>

      <div className="space-y-6">
        {/* Login */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /tenant/practitioner/login</h3>
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading.login}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.login ? 'Logging in...' : 'Practitioner Login'}
            </button>
          </form>

          {loginResult && (
            <div className={`mt-4 p-3 rounded ${loginResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {loginResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(loginResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Exchange Token */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /tenant/practitioner/exchange-token</h3>
          <button
            onClick={handleExchangeToken}
            disabled={loading.exchange}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.exchange ? 'Exchanging...' : 'Exchange Token'}
          </button>

          {exchangeResult && (
            <div className={`mt-4 p-3 rounded ${exchangeResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {exchangeResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(exchangeResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* MFA */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /tenant/practitioner/mfa</h3>
          <form onSubmit={handleMFA} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MFA Code
              </label>
              <input
                type="text"
                value={mfaData.code}
                onChange={(e) => setMfaData({ ...mfaData, code: e.target.value })}
                placeholder="Enter MFA code"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading.mfa}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.mfa ? 'Verifying...' : 'Verify MFA'}
            </button>
          </form>

          {mfaResult && (
            <div className={`mt-4 p-3 rounded ${mfaResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {mfaResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(mfaResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Notes Section */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Testing Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Practitioner login uses different endpoint than standard login</li>
          <li>Tokens are stored separately (practitioner_access_token)</li>
          <li>MFA may be required depending on account settings</li>
          <li>Exchange token converts initial token to tenant-scoped token</li>
        </ul>
      </div>
    </div>
  )
}



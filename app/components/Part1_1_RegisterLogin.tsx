'use client'

import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function Part1_1_RegisterLogin() {
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    clientId: '',
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [registerResult, setRegisterResult] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [loading, setLoading] = useState({ register: false, login: false })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ ...loading, register: true })
    setRegisterResult(null)

    try {
      const response = await apiClient.post('/auth/register', registerData)
      setRegisterResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      // Save tokens if provided
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
    } catch (error: any) {
      setRegisterResult({
        status: error.response?.status || 'Error',
        data: error.response?.data || error.message,
        success: false,
      })
    } finally {
      setLoading({ ...loading, register: false })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ ...loading, login: true })
    setLoginResult(null)

    try {
      const response = await apiClient.post('/auth/login', loginData)
      setLoginResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      // Save tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Part 1.1: Register & Login</h2>
        <p className="text-gray-600 text-sm mb-4">
          Test user registration and login endpoints. These are the foundation for all other API calls.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Register Form */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /auth/register</h3>
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
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
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Surname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registerData.surname}
                onChange={(e) => setRegisterData({ ...registerData, surname: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={registerData.clientId}
                onChange={(e) => setRegisterData({ ...registerData, clientId: e.target.value })}
                placeholder="Enter your client ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Required field - check your API documentation for the correct client ID</p>
            </div>
            <button
              type="submit"
              disabled={loading.register}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.register ? 'Registering...' : 'Register'}
            </button>
          </form>

          {registerResult && (
            <div className={`mt-4 p-3 rounded ${registerResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-sm font-medium mb-2">
                Status: {registerResult.status}
              </div>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify(registerResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /auth/login</h3>
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
              {loading.login ? 'Logging in...' : 'Login'}
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
      </div>

      {/* Notes Section */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Testing Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Register a new account first, then try logging in</li>
          <li><strong>Required fields:</strong> clientId and surname are mandatory</li>
          <li>Check if tokens are saved to localStorage</li>
          <li>Verify response structure matches expected format</li>
          <li>Test with invalid credentials to see error responses</li>
        </ul>
      </div>
    </div>
  )
}


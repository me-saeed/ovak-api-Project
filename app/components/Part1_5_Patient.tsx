'use client'

import { useState } from 'react'
import apiClient from '@/lib/api-client'

export default function Part1_5_Patient() {
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })
  const [mfaData, setMfaData] = useState({
    code: '',
  })
  const [registerResult, setRegisterResult] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [exchangeResult, setExchangeResult] = useState<any>(null)
  const [mfaResult, setMfaResult] = useState<any>(null)
  const [loading, setLoading] = useState({ 
    register: false, 
    login: false, 
    exchange: false, 
    mfa: false 
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading({ ...loading, register: true })
    setRegisterResult(null)

    try {
      const response = await apiClient.post('/tenant/patient/register', registerData)
      setRegisterResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      if (response.data.access_token) {
        localStorage.setItem('patient_access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('patient_refresh_token', response.data.refresh_token)
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
      const response = await apiClient.post('/tenant/patient/login', loginData)
      setLoginResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      if (response.data.access_token) {
        localStorage.setItem('patient_access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('patient_refresh_token', response.data.refresh_token)
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

    const token = localStorage.getItem('patient_access_token')
    if (!token) {
      setExchangeResult({
        status: 'Error',
        data: { error: 'No patient token found. Please login first.' },
        success: false,
      })
      setLoading({ ...loading, exchange: false })
      return
    }

    try {
      const response = await apiClient.post('/tenant/patient/exchange-token', {
        token: token,
      })
      setExchangeResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      if (response.data.access_token) {
        localStorage.setItem('patient_access_token', response.data.access_token)
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
      const response = await apiClient.post('/tenant/patient/mfa', {
        ...mfaData,
        token: localStorage.getItem('patient_access_token'),
      })
      setMfaResult({
        status: response.status,
        data: response.data,
        success: true,
      })
      if (response.data.access_token) {
        localStorage.setItem('patient_access_token', response.data.access_token)
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
        <h2 className="text-xl font-semibold mb-2">Part 1.5: Patient Authentication</h2>
        <p className="text-gray-600 text-sm mb-4">
          Test patient-specific authentication endpoints. These are for patients accessing their health data.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Register */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /tenant/patient/register</h3>
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
            <button
              type="submit"
              disabled={loading.register}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.register ? 'Registering...' : 'Patient Register'}
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

        {/* Login */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /tenant/patient/login</h3>
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
              {loading.login ? 'Logging in...' : 'Patient Login'}
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Exchange Token */}
        <div className="border rounded-lg p-4">
          <h3 className="font-medium mb-4">POST /tenant/patient/exchange-token</h3>
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
          <h3 className="font-medium mb-4">POST /tenant/patient/mfa</h3>
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
          <li>Patient registration creates a patient account in the tenant system</li>
          <li>Patient tokens are stored separately (patient_access_token)</li>
          <li>Patients can only access their own health data</li>
          <li>MFA may be required depending on security settings</li>
        </ul>
      </div>
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'

interface APIResult {
  success: boolean
  status?: number
  data?: any
  error?: string
}

export default function APIExplorer() {
  const [endpoint, setEndpoint] = useState('/fhir/Patient')
  const [method, setMethod] = useState('GET')
  const [requestBody, setRequestBody] = useState('')
  const [queryParams, setQueryParams] = useState('_count=10')
  const [result, setResult] = useState<APIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)

  // Fetch user info on mount
  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await apiClient.get('/auth/me')
      setUserInfo(response.data)
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const testAPI = async () => {
    setLoading(true)
    setResult(null)

    try {
      let response
      const config: any = {}

      // Add query parameters if provided
      if (queryParams && method === 'GET') {
        const params = new URLSearchParams(queryParams)
        config.params = Object.fromEntries(params)
      }

      // Parse and add request body for POST/PUT/PATCH
      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
        try {
          config.data = JSON.parse(requestBody)
        } catch (e) {
          setResult({
            success: false,
            error: 'Invalid JSON in request body'
          })
          setLoading(false)
          return
        }
      }

      switch (method) {
        case 'GET':
          response = await apiClient.get(endpoint, config)
          break
        case 'POST':
          response = await apiClient.post(endpoint, config.data, { params: config.params })
          break
        case 'PUT':
          response = await apiClient.put(endpoint, config.data, { params: config.params })
          break
        case 'PATCH':
          response = await apiClient.patch(endpoint, config.data, { params: config.params })
          break
        case 'DELETE':
          response = await apiClient.delete(endpoint, config)
          break
        default:
          response = await apiClient.get(endpoint, config)
      }

      setResult({
        success: true,
        status: response.status,
        data: response.data
      })
    } catch (error: any) {
      setResult({
        success: false,
        status: error.response?.status,
        error: error.message,
        data: error.response?.data
      })
    } finally {
      setLoading(false)
    }
  }

  const presetEndpoints = [
    { label: 'Get Patients', method: 'GET', endpoint: '/fhir/Patient', params: '_count=10' },
    { label: 'Get Observations', method: 'GET', endpoint: '/fhir/Observation', params: '_count=10' },
    { label: 'Get Practitioners', method: 'GET', endpoint: '/fhir/Practitioner', params: '_count=10' },
    { label: 'Get Service Requests', method: 'GET', endpoint: '/fhir/ServiceRequest', params: '_count=10' },
    { label: 'Get Diagnostic Reports', method: 'GET', endpoint: '/fhir/DiagnosticReport', params: '_count=10' },
    { label: 'Get Questionnaires', method: 'GET', endpoint: '/fhir/Questionnaire', params: '_count=10' },
    { label: 'Get My Profile', method: 'GET', endpoint: '/auth/me', params: '' },
    { label: 'Get Account Info', method: 'GET', endpoint: '/auth/account', params: '' },
    { label: 'Get Sessions', method: 'GET', endpoint: '/auth/sessions', params: '' },
  ]

  const loadPreset = (preset: typeof presetEndpoints[0]) => {
    setMethod(preset.method)
    setEndpoint(preset.endpoint)
    setQueryParams(preset.params)
    setRequestBody('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">API Explorer</h2>
        <p className="text-gray-600 text-sm mb-4">
          Test and explore Ovok APIs. Your access token is automatically included in all requests.
        </p>
      </div>

      {/* User Info Card */}
      {userInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Your Account Info</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Email:</strong> {userInfo.user?.email}</p>
            <p><strong>Project:</strong> {userInfo.project?.name} ({userInfo.project?.id})</p>
            <p><strong>Profile:</strong> {userInfo.profile?.name?.[0]?.given?.[0]} {userInfo.profile?.name?.[0]?.family}</p>
            <p><strong>Role:</strong> {userInfo.membership?.admin ? 'Admin' : 'User'}</p>
          </div>
        </div>
      )}

      {/* Preset Endpoints */}
      <div>
        <h3 className="font-medium mb-2">Quick Presets</h3>
        <div className="flex flex-wrap gap-2">
          {presetEndpoints.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* API Tester Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              HTTP Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/fhir/Patient"
            />
          </div>
        </div>

        {method === 'GET' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Query Parameters (e.g., _count=10&status=active)
            </label>
            <input
              type="text"
              value={queryParams}
              onChange={(e) => setQueryParams(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="_count=10"
            />
          </div>
        )}

        {['POST', 'PUT', 'PATCH'].includes(method) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Body (JSON)
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
              placeholder='{\n  "resourceType": "Patient",\n  "name": [{"given": ["John"], "family": "Doe"}]\n}'
            />
          </div>
        )}

        <button
          onClick={testAPI}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing API...' : `Test ${method} ${endpoint}`}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className={`border rounded-lg p-4 ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">
              {result.success ? (
                <span className="text-green-900">✅ Success</span>
              ) : (
                <span className="text-red-900">❌ Error</span>
              )}
            </div>
            {result.status && (
              <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                Status: {result.status}
              </span>
            )}
          </div>
          
          {result.error && (
            <div className="mb-2 text-sm text-red-800">
              <strong>Error:</strong> {result.error}
            </div>
          )}

          <pre className="text-xs overflow-auto max-h-96 bg-white p-3 rounded border">
            {JSON.stringify(result.data || result, null, 2)}
          </pre>
        </div>
      )}

      {/* Example Requests */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-medium mb-3">Example API Calls</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">1. Search Patients:</p>
            <code className="block bg-white p-2 rounded text-xs">
              GET /fhir/Patient?_count=10&name=John
            </code>
          </div>
          <div>
            <p className="font-medium mb-1">2. Create Patient:</p>
            <code className="block bg-white p-2 rounded text-xs">
              POST /fhir/Patient<br />
              {JSON.stringify({
                resourceType: "Patient",
                name: [{ given: ["John"], family: "Doe" }]
              }, null, 2)}
            </code>
          </div>
          <div>
            <p className="font-medium mb-1">3. Get Specific Patient:</p>
            <code className="block bg-white p-2 rounded text-xs">
              GET /fhir/Patient/{'{patientId}'}
            </code>
          </div>
          <div>
            <p className="font-medium mb-1">4. Search Observations:</p>
            <code className="block bg-white p-2 rounded text-xs">
              GET /fhir/Observation?subject=Patient/{'{patientId}'}&_count=20
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}


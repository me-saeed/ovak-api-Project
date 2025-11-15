'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { logout, isAuthenticated } from '@/lib/auth'
import { useEffect } from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated() && pathname !== '/login') {
      router.push('/login')
    }
  }, [pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Patients', href: '/patients', icon: '👥' },
    { name: 'Appointments', href: '/appointments', icon: '📅' },
    { name: 'Encounters', href: '/encounters', icon: '🏥' },
    { name: 'Observations', href: '/observations', icon: '📋' },
    { name: 'Questionnaires', href: '/questionnaires', icon: '📝' },
    { name: 'Documents', href: '/documents', icon: '📁' },
  ]

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-blue-600">
            <h1 className="text-xl font-bold text-white">Ovok Health</h1>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <span className="mr-3">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}


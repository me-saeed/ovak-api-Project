import type { Metadata } from 'next'
import './globals.css'
import Layout from './components/Layout'

export const metadata: Metadata = {
  title: 'Ovok Health - Healthcare Management Platform',
  description: 'Modern healthcare application built on Ovok API',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}



import '../styles/globals.css'
import React from 'react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export const metadata = {
  title: 'Tenant Management',
  description: 'Tenant & Property Management MVP'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

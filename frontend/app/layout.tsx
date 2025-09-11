import './styles/globals.css'  // Changed from '../' to './'
import React from 'react'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'
import { ToastProvider } from "@/components/ui/toast";

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



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

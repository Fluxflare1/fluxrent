import './globals.css'
import Sidebar from '../components/layout/Sidebar'
import Topbar from '../components/layout/Topbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <Topbar />
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  )
}

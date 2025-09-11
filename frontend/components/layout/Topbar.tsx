import React from 'react'

export default function Topbar() {
  return (
    <header className="bg-white border-b p-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">Admin Dashboard</div>
      <div>
        <button className="px-3 py-1 bg-blue-600 text-white rounded">Sign Out</button>
      </div>
    </header>
  )
}

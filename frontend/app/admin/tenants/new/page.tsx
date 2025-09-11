'use client'
import React from 'react'
import TenantForm from '../../../../components/forms/TenantForm'

export default function NewTenantPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Add Tenant</h2>
      <div className="card">
        <TenantForm />
      </div>
    </div>
  )
}

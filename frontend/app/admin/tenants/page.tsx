"use client"
import { useEffect, useState } from "react"
import TenantTable from "../../../components/tables/TenantTable"
import axios from "axios"

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([])

  useEffect(() => {
    axios.get("/api/tenants").then(res => setTenants(res.data))
  }, [])

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Tenants</h1>
      <TenantTable tenants={tenants} />
    </div>
  )
}

"use client"

import * as React from "react"
import { Table, Th, Td, Tr } from "./table"

interface Column<T> {
  key: keyof T
  header: string
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
}: {
  columns: Column<T>[]
  data: T[]
}) {
  return (
    <Table>
      <thead>
        <Tr>
          {columns.map((c) => (
            <Th key={String(c.key)}>{c.header}</Th>
          ))}
        </Tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <Tr key={row.id}>
            {columns.map((c) => (
              <Td key={String(c.key)}>{String(row[c.key])}</Td>
            ))}
          </Tr>
        ))}
      </tbody>
    </Table>
  )
}

"use client";

import { useEffect, useState } from "react";

type RouteInfo = {
  path: string;
  methods: string[];
  description: string;
  fullUrl: string;
};

export default function ApiDocsPage() {
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoutes() {
      try {
        const res = await fetch("/api/index");
        const data = await res.json();
        if (data?.availableRoutes) {
          setRoutes(data.availableRoutes);
        }
      } catch (e) {
        console.error("Failed to load API index:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchRoutes();
  }, []);

  if (loading) {
    return <div className="p-6">Loading API documentation...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">PTM-MVP API Documentation</h1>
      <p className="text-gray-600 mb-6">
        Below are the available API endpoints for the Property Tenant
        Management MVP.
      </p>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left border-b">Path</th>
              <th className="p-3 text-left border-b">Methods</th>
              <th className="p-3 text-left border-b">Description</th>
              <th className="p-3 text-left border-b">Try</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 border-b font-mono">{route.path}</td>
                <td className="p-3 border-b">
                  {route.methods.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-1 mr-2 text-xs font-semibold rounded bg-blue-100 text-blue-800"
                    >
                      {m}
                    </span>
                  ))}
                </td>
                <td className="p-3 border-b">{route.description}</td>
                <td className="p-3 border-b">
                  <a
                    href={route.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

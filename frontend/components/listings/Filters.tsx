"use client";

import { useState } from "react";

export interface FiltersProps {
  onChange: (filters: Record<string, any>) => void;
}

export default function Filters({ onChange }: FiltersProps) {
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    property_type: "",
    bedrooms: "",
    bathrooms: "",
  });

  function updateField(field: string, value: string | number) {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onChange(newFilters);
  }

  return (
    <div className="space-y-4 bg-white p-4 border rounded-lg shadow-sm">
      <h3 className="font-semibold text-lg mb-2">Filters</h3>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600">Price (₦)</label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price}
            onChange={(e) => updateField("min_price", e.target.value)}
            className="w-1/2 border rounded px-2 py-1 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price}
            onChange={(e) => updateField("max_price", e.target.value)}
            className="w-1/2 border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">Property Type</label>
        <select
          value={filters.property_type}
          onChange={(e) => updateField("property_type", e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          <option value="">Any</option>
          <option value="apartment">Apartment</option>
          <option value="house">House</option>
          <option value="duplex">Duplex</option>
          <option value="bungalow">Bungalow</option>
          <option value="land">Land</option>
          <option value="service_apartment">Service Apartment</option>
        </select>
      </div>

      {/* Bedrooms */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">Bedrooms</label>
        <input
          type="number"
          min="0"
          placeholder="Any"
          value={filters.bedrooms}
          onChange={(e) => updateField("bedrooms", e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>

      {/* Bathrooms */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-600">Bathrooms</label>
        <input
          type="number"
          min="0"
          placeholder="Any"
          value={filters.bathrooms}
          onChange={(e) => updateField("bathrooms", e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}

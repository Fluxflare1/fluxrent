// frontend/components/listings/FiltersPanel.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { MapPin, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const defaultPageSize = 12;

export default function FiltersPanel({ initial }: { initial?: Record<string, any> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getParam = (k: string) => searchParams?.get(k) ?? "";

  const [q, setQ] = useState(getParam("q") || "");
  const [listingType, setListingType] = useState(getParam("listing_type") || "");
  const [minPrice, setMinPrice] = useState(getParam("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(getParam("max_price") || "");
  const [bedrooms, setBedrooms] = useState(getParam("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(getParam("bathrooms") || "");
  const [radius, setRadius] = useState(getParam("radius") || "10");
  const [lat, setLat] = useState(getParam("lat") || "");
  const [lng, setLng] = useState(getParam("lng") || "");
  const [sort, setSort] = useState(getParam("ordering") || "");
  const [isLocating, setIsLocating] = useState(false);

  // Sync with URL search params
  useEffect(() => {
    const urlQuery = searchParams?.get("q") || "";
    setQ(urlQuery);
  }, [searchParams]);

  const applyFilters = useCallback((overrides: Record<string, any> = {}) => {
    const current = Object.fromEntries(Array.from(searchParams || new URLSearchParams()));
    const next = {
      page: "1", // Reset to first page on filter change
      page_size: defaultPageSize.toString(),
      q: q || undefined,
      listing_type: listingType || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      radius: radius || undefined,
      lat: lat || undefined,
      lng: lng || undefined,
      ordering: sort || undefined,
      ...overrides,
    };

    // Remove undefined and empty values
    const cleaned: Record<string, string> = {};
    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== "") cleaned[k] = v;
    });

    const queryString = new URLSearchParams(cleaned).toString();
    router.push(`/properties?${queryString}`, { scroll: false });
  }, [q, listingType, minPrice, maxPrice, bedrooms, bathrooms, radius, lat, lng, sort, router, searchParams]);

  // Debounced search - only for search query changes
  const debouncedApply = useCallback(
    debounce(() => {
      if (q.length >= 3 || q.length === 0) {
        applyFilters();
      }
    }, 500),
    [applyFilters, q]
  );

  useEffect(() => {
    debouncedApply();
    return () => debouncedApply.cancel();
  }, [q, debouncedApply]);

  // Apply other filters immediately when changed (except search)
  useEffect(() => {
    if (q.length === 0 || q.length >= 3) {
      const timeoutId = setTimeout(() => {
        applyFilters();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [listingType, minPrice, maxPrice, bedrooms, bathrooms, radius, lat, lng, sort, applyFilters, q]);

  const onClear = () => {
    setQ("");
    setListingType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setBathrooms("");
    setRadius("10");
    setLat("");
    setLng("");
    setSort("");
    router.push("/properties");
  };

  const onUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setIsLocating(false);
        applyFilters({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please ensure location services are enabled.");
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const hasActiveFilters = () => {
    return !!(q || listingType || minPrice || maxPrice || bedrooms || bathrooms || 
             (lat && lng) || sort !== "" || radius !== "10");
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Filters
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={onClear} className="h-8 px-2 text-xs">
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, location, description..."
            className="w-full"
            aria-label="Search listings"
          />
        </div>

        {/* Listing Type and Bedrooms */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="listing-type">Property Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger id="listing-type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="RENT">Rent</SelectItem>
                <SelectItem value="LEASE">Lease</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="SERVICE_APARTMENT">Service Apartment</SelectItem>
                <SelectItem value="LAND">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Select value={bedrooms} onValueChange={setBedrooms}>
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min price"
              min="0"
            />
            <Input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max price"
              min="0"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label htmlFor="sort">Sort By</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Default</SelectItem>
              <SelectItem value="-created_at">Newest</SelectItem>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="-price">Price: High to Low</SelectItem>
              <SelectItem value="-ranking_score">Top Ranked</SelectItem>
              <SelectItem value="-engagement__views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
          <Label className="text-sm font-medium">Location Filter</Label>
          
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude"
            />
            <Input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <Input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-20"
                min="1"
                max="100"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">km radius</span>
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUseMyLocation}
              disabled={isLocating}
              className="flex items-center gap-1"
            >
              <MapPin className="h-3 w-3" />
              {isLocating ? "Locating..." : "My Location"}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => applyFilters()} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

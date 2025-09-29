// frontend/components/ListingsSearchBar.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ListingsSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState(false);

  // Sync with URL search params on initial load [citation:1]
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
  }, [searchParams]);

  // Debounced search to reduce server requests [citation:2]
  useEffect(() => {
    if (query.length === 0 || query.length >= 3) {
      const delayDebounceFn = setTimeout(() => {
        if (query.length >= 3 || query.length === 0) {
          handleSearch();
        }
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [query]);

  const handleSearch = useCallback(() => {
    setIsLoading(true);
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      newParams.set("q", query.trim());
      newParams.delete("page"); // Reset to first page on new search
    } else {
      newParams.delete("q");
    }

    router.push(`/properties?${newParams.toString()}`, { scroll: false });
    
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 300);
  }, [query, router, searchParams]);

  const clearSearch = () => {
    setQuery("");
    // The useEffect will trigger and handle the URL update
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      clearSearch();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-8">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by title, address, description..."
              className="pl-10 pr-10 py-2 h-11"
              disabled={isLoading}
              aria-label="Search properties"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {isLoading ? "..." : "Search"}
          </Button>
        </form>
        
        {/* Search tips */}
        <div className="mt-3 text-xs text-gray-500">
          <p>Try searching by property title, location, or features</p>
        </div>
      </CardContent>
    </Card>
  );
}

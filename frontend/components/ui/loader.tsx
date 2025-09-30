import React from "react";

export default function Loader() {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />
    </div>
  );
}

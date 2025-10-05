'use client';

import dynamic from "next/dynamic";

const DisputeAdminClient = dynamic(
  () => import("@/components/admin/DisputeAdmin"),
  { 
    ssr: false,
    loading: () => <p>Loading disputes...</p>
  }
);

export default DisputeAdminClient;

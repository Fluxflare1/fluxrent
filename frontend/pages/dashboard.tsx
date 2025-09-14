// frontend/pages/dashboard.tsx
import { getSession, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";

export default function Dashboard() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-lg">Loading...</h1>
      </div>
    );
  }

  const role = (session.user as any)?.role;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {session.user?.email}</h1>
      <p className="text-gray-600 mb-6">Role: {role}</p>

      {role === "admin" && (
        <div className="bg-blue-50 p-4 rounded shadow">
          <h2 className="font-semibold">Admin Dashboard</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>Manage users</li>
            <li>System settings</li>
          </ul>
        </div>
      )}

      {role === "property_admin" && (
        <div className="bg-green-50 p-4 rounded shadow">
          <h2 className="font-semibold">Property Admin Dashboard</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>Manage properties</li>
            <li>View tenant reports</li>
          </ul>
        </div>
      )}

      {role === "tenant" && (
        <div className="bg-yellow-50 p-4 rounded shadow">
          <h2 className="font-semibold">Tenant Dashboard</h2>
          <ul className="list-disc ml-6 mt-2">
            <li>View rental info</li>
            <li>Submit maintenance requests</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

// frontend/pages/auth/signin.tsx
import { useState } from "react";
import { getCsrfToken, signIn } from "next-auth/react";
import { GetServerSideProps } from "next";

interface Props {
  csrfToken: string;
}

export default function SignIn({ csrfToken }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: true,
      email,
      password,
      callbackUrl: "/dashboard",
    });
    console.log("Login result:", result);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        method="post"
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 w-96"
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <h1 className="text-xl font-bold mb-4">Sign In</h1>

        <label className="block mb-2 text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          required
        />

        <label className="block mb-2 text-sm">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
};

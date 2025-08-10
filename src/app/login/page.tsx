import { login } from "./actions";
import { Inter } from "next/font/google";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

const inter = Inter({ subsets: ["latin"] });

export default function LoginPage() {
  return (
    <div
      className={`${inter.className} flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-200 p-4`}
    >
      <form className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500">Please sign in to your account</p>
        </div>
        <div className="space-y-4">
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition hover:border-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-900 placeholder-gray-400 transition hover:border-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          className="w-full rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-white shadow transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 active:scale-[0.98]"
          formAction={login}
        >
          Sign In
        </button>
        <a
          href="#"
          className="block text-center text-sm text-blue-600 transition hover:underline"
        >
          Forgot password?
        </a>
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition hover:bg-gray-50 active:scale-95"
            aria-label="Sign in with Google"
          >
            <FcGoogle size={20} />
          </button>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white shadow-sm transition hover:bg-gray-50 active:scale-95"
            aria-label="Sign in with Apple"
          >
            <FaApple size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

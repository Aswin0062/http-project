"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Dog } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useSearchParams } from "next/navigation";

const AuthPageContent = () => {
  const { logIn, signUp } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string>(searchParams.get("error") ?? "");

  const isValidPassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await logIn(email, password);
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signUp(email, password);
      if (res) {
        setIsLogin(true);
        resetForm();
      }
    } catch (error) {
      setMessage("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMessage("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-b from-gray-200 to-gray-400">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2"
      >
        <Dog className="h-6 w-6" />
        <span className="font-bold">HTTP Dogs</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] border rounded-lg bg-white px-6 py-8 shadow-lg">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to HTTP Dogs
          </h1>
          <p className="text-sm text-gray-600">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </p>
        </div>

        <div className="w-full">
          <div className="grid w-full grid-cols-2 border-b">
            <button
              className={`p-2 w-full text-center ${
                isLogin ? "bg-gray-300" : ""
              }`}
              onClick={() => {
                setIsLogin(true);
                resetForm();
              }}
            >
              Login
            </button>
            <button
              className={`p-2 w-full text-center ${
                !isLogin ? "bg-gray-300" : ""
              }`}
              onClick={() => {
                setIsLogin(false);
                resetForm();
              }}
            >
              Sign Up
            </button>
          </div>

          <div className="p-4 border rounded-md mt-2">
            <h2 className="text-lg font-semibold">
              {isLogin ? "Login" : "Sign Up"}
            </h2>
            <p className="text-sm text-gray-600">
              {isLogin
                ? "Enter your email and password to sign in"
                : "Create a new account"}
            </p>

            {message && (
              <p className="text-center text-sm text-red-500">{message}</p>
            )}

            <form
              onSubmit={isLogin ? handleSignIn : handleSignUp}
              className="space-y-4 mt-4"
            >
              <div className="space-y-2">
                <span className="text-sm font-medium">Email</span>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Password</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {!isLogin &&
                !isValidPassword(password) &&
                password.length > 0 && (
                  <p className="text-xs text-red-500">
                    Password must be at least 8 characters, include one
                    uppercase letter, one lowercase letter, one number, and one
                    special character.
                  </p>
                )}

              <button
                type="submit"
                className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading || (!isLogin && !isValidPassword(password))}
              >
                {loading
                  ? isLogin
                    ? "Signing in..."
                    : "Signing up..."
                  : isLogin
                  ? "Sign In"
                  : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthPage = () => {
  return (
    <Suspense fallback={<div className="text-center mt-4">Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
};

export default AuthPage;

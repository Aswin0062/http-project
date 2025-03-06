"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react"
import { LoginService } from "@/services/LoginService"
import { ISignUpResponse } from "@/dao"

type User = {
  id: string
  email: string
}

type AuthContextType = {
  user: User | null
  logIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<boolean>
  logOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthActionsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { data, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (data?.userId && data.user) {
      setUser({ email: data.user.email!, id: data.userId })
    }
    setLoading(status === 'loading');
  }, [data, status])

  const logIn = useCallback(async (email: string, password: string) => {
    let res = null;
    let toastProps = {};
    try {
      res = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      toastProps = {
        title: "Error signing in",
        description: "Please try again.",
        variant: "destructive",
      }
      throw new Error("Login Failed.Please try again.");
    }
    if (res?.error) {
      toastProps = {
        title: "Error signing in",
        description: res.error,
        variant: "destructive",
      }
      toast(toastProps);
      throw new Error(res.error);
    }
    if (res?.ok) {
      toastProps = {
        title: "Signed in successfully",
        description: `Welcome back, ${email}!`,
      }
      toast(toastProps);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const response: ISignUpResponse | null = await LoginService.signUp(email, password);
    if (response) {
      toast({
        title: response.result ? "Account created successfully" : "Account Creation Failed",
        description: response.result ? `Welcome, ${email}!` : response.message,
      })
    } else {
      toast({
        title: "Error creating account",
        description: "Please try again.",
        variant: "destructive",
      })
    }
    return !!response?.result;
  }, []);

  const logOut = useCallback(async () => {
    await signOut({callbackUrl: '/', redirect: true});
    toast({
      title: "Signed out successfully",
      description: "You have been signed out of your account.",
    });
  }, []);

  return <AuthContext.Provider value={{ user, logIn, signUp, logOut, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider><AuthActionsProvider>{children}</AuthActionsProvider></SessionProvider>
}
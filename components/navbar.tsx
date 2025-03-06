"use client";
import Link from "next/link"
import { Dog, List, LogOut, Search } from "lucide-react"
import { useAuth } from "./auth-provider";

export default function Navbar() {
  const { user, logOut, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Dog className="h-6 w-6" />
              <span>HTTP Dogs</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4">
              <Link href="/search">
                <button className="gap-2 flex flex-row items-center justify-center">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline-block">Search</span>
                </button>
              </Link>
              <Link href="/filters">
                <button className="border-[1px] flex flex-row gap-2 items-center p-2 rounded-lg hover:bg-black hover:text-white transition">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline-block">My Filters</span>
                </button>
              </Link>
              <button className="border-[1px] flex flex-row gap-2 items-center p-2 rounded-lg hover:bg-black hover:text-white transition" onClick={() => logOut()}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline-block">Sign Out</span>
              </button>
            </nav>
          </div>
        </header>
  )
}


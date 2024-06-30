"use client";
import Link from "next/link"
import { logout } from "@/lib/actions/auth"
import { MouseEvent } from "react";


const DashboardHeader = () => {
  const Logout = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logout()

  }
  return (
    <header className="w-full shadow-md sticky bg-darkVariant top-0 drop-shadow-md z-10 flex-initial text-white">
        <div className="flex p-4">
            <Link href={"/dashboard"} className="font-bold font-size-default">
                Flowsheet
            </Link>
            <nav className="flex pl-4 gap-x-4 ml-auto">
                <Link href={"/projects"} className="font-bold font-size-default">Projects</Link>
                <Link href={"/profile"} className="font-bold font-size-default">Profile</Link>
                <Link href={"/logout"} onClick={Logout} className="font-bold font-size-default">Log out</Link>
            </nav>
        </div>
        
    </header>
  )
}

export default DashboardHeader

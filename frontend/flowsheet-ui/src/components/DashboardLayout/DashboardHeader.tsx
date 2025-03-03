"use client";
import Link from "next/link"
import { logout } from "@/lib/actions/auth"
import { MouseEvent, useState, useContext } from "react";
import Logo from "../Logo";
import logoIcon from "@/assets/logo-icon-2.svg"
import searchIcon from "@/assets/search-project.svg"
import arrowDown from "@/assets/arrow-down.svg"
import arrowUp from "@/assets/arrow-up.svg"
import Image from "next/image";
import { UserContext } from "../context/UserProvider";



const DashboardHeader = () => {
  const [showDropDown, setShowDropDown] = useState(false)
  const {user} = useContext(UserContext)
  const Logout = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logout()

  }
  return (
    <header className="w-full sticky bg-grayVariant border-b border-[#DFE1E6] top-0 z-30 flex-initial text-white">
        <div className="flex py-4 px-8 w-full">
            <Logo logoIcon={logoIcon}/>
            <div className="py-2 px-4 flex items-center gap-2 border border-[#B3B3B3] rounded-lg ml-auto">
              <Image src={searchIcon} width={20} height={20} alt="search icon" />
              <input type="text" placeholder="Search project or flowsheet" className="bg-transparent text-sm font-normal text-[#666666] focus:outline-none"/>

            </div>
            <nav className="flex items-center pl-4 gap-x-2 ml-auto">
              {
                user ? <>
                  <div className="bg-[#E381E3] font-semibold text-[#261A26] text-base w-10 h-10 border border-[#CC74CC] flex items-center justify-center rounded-full" style={{boxShadow: "0px -4px 5px -2px #0000000D inset"}}>
                    {user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="text-base font-normal text-black">
                    {user?.email}
                  </p>
                </> : ""
              }
              
              <div className="relative">
                <Image src={showDropDown? arrowUp : arrowDown} width={10} height={10} alt="arrow Down" className="cursor-pointer" onClick={() => setShowDropDown((prev)=> !prev)}/>
                <div className={`z-10 absolute shadow-sm rounded-md flex-col bg-white transition-all top-[200%] -left-[500%] ${showDropDown ? "opacity-100 visible" : "invisible opacity-0"}`}>
                  <button className="text-black py-2 px-4" onClick={Logout}>Logout</button>

                </div>
              </div>
                
            </nav>
        </div>
        
    </header>
  )
}

export default DashboardHeader
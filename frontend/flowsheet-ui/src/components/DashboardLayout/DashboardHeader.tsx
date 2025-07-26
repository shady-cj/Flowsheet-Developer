"use client";
import Link from "next/link"
import { logout } from "@/lib/actions/auth"
import { MouseEvent, useState, useContext, ChangeEvent } from "react";
import Logo from "../Logo";
import logoIcon from "@/assets/logo-icon-2.svg"
import searchIcon from "@/assets/search-project.svg"
import arrowDown from "@/assets/arrow-down.svg"
import arrowUp from "@/assets/arrow-up.svg"
import arrowRight from "@/assets/arrow-right.svg";
import Image from "next/image";
import { UserContext } from "../context/UserProvider";
import { dashboardSearch } from "@/lib/actions/dashboard";
import { fetchedFlowsheetsType, fetchedProjectType } from "./DashboardPageRenderer";



const DashboardHeader = () => {
  const [showDropDown, setShowDropDown] = useState(false)
  const {user} = useContext(UserContext)
  const [searchResult, setSearchResult] = useState<null | {projects: fetchedProjectType[], flowsheets: fetchedFlowsheetsType[]}>(null)
  const Logout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout()

  }
  const handleSearchInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim()
    if (query.length < 3) {
      setSearchResult(null)
      return
    }
    setSearchResult(await dashboardSearch(query))
    
  }
  return (
    <header className="w-full sticky bg-grayVariant border-b border-[#DFE1E6] top-0 z-30 flex-initial text-white" id="dashboard-header">
        <div className="flex py-4 px-8 w-full">
            <Logo logoIcon={logoIcon}/>
            <div className="relative py-2 px-4 flex items-center gap-2 border border-[#B3B3B3] rounded-lg ml-auto">
              <Image src={searchIcon} width={20} height={20} alt="search icon" />
              <input type="text" placeholder="Search project or flowsheet" className="bg-transparent text-sm font-normal text-[#666666] focus:outline-none" onChange={handleSearchInput}/>
              {
                searchResult ? (
                  <div className='absolute shadow-sm w-[25vw] min-h-[20vh] left-0 top-[150%] z-20 bg-white text-black rounded-xl px-4 py-6'>
                    <h2 className='text-xl font-semibold mb-2'>Search Results</h2> 
                    <hr />

                    {
                      searchResult.projects && searchResult.projects.length ? (
                        <section className="py-2 px-3">
                          <h3 className='text-lg font-semibold'>
                            Projects
                          </h3>
                          <article className='pt-4 pb-2 flex flex-col gap-3'> 
                          {
                                searchResult.projects.map(project => <Link key={project.id} href={`/${project.link}`} className='w-[80%] text-text-black-2 font-medium flex justify-between px-4'>
                                {project.name}
                                <Image src={arrowRight} height={10} width={10} alt="arrow right"/>
                                
                                </Link> 
                                )
                            }
      
                          </article>
                        </section>

                      ) : ""
                      
                    }
                    {
                      (searchResult.projects && searchResult.projects.length && searchResult.flowsheets && searchResult.flowsheets.length) ? <hr /> : ""
                    }
                    {
                      searchResult.flowsheets && searchResult.flowsheets.length ? (
                        <section className="py-2 px-3">
                          <h3 className='text-lg font-semibold'>
                            Flowsheet
                          </h3>
                          <article className='pt-4 pb-2 flex flex-col gap-3'> 
                          {
                                searchResult.flowsheets.map(flowsheet => <Link key={flowsheet.id} href={`/${flowsheet.link}`} className='w-[80%] text-text-black-2 font-medium flex justify-between px-4'>
                                {flowsheet.name}
                                <Image src={arrowRight} height={10} width={10} alt="arrow right"/>
                                
                                </Link> 
                                )
                            }
      
                          </article>
                        </section>

                      ) : ""
                      
                    }
                    
                  </div>
                ): ""
              }
              
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
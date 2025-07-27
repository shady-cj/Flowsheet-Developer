"use client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { fetchedFlowsheetsType, fetchedProjectType } from "./DashboardPageRenderer"
import { fetchDashboardFlowsheets, fetchDashboardProjects } from "@/lib/actions/dashboard"
import arrowRight from "@/assets/arrow-right.svg";
import Image from "next/image"

const DashboardSidebar = () => {
  const [data, setData] = useState<(fetchedFlowsheetsType | fetchedProjectType)[]>([])
  const selectType = useRef<HTMLSelectElement>(null!)
  const searchParams = useSearchParams()
  const type = searchParams.get("f")
  // console.log("search param type", type)
  const fetchData = async () => {
    let response;
    if (selectType.current.value === "projects") 
      response = await fetchDashboardProjects("recents", 5, 0)
    else 
      response = await fetchDashboardFlowsheets("recents", 5, 0)
    console.log("response", response)
    setData(response.results)
  }

  useEffect(() =>{
    fetchData();
  }, [])
  return (
    <div className="w-[22%] shrink-0 bg-white border-r border-solid border-[#DFE1E6]">
        <section className="w-full">
          <div className="h-[14.5rem] border-b border-solid border-[#E6E6E6] pt-12">
            <div className="px-6 w-full flex flex-col gap-y-4 ">
              <Link href="/dashboard" className={`w-full inline-flex ${type === null ? "bg-normalBlueVariant": "bg-grayVariant"} flex-row items-center gap-x-3 px-4 py-2.5 rounded-lg`}>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 48 48" fill="none">
                  <path d="M 23.951172 4 A 1.50015 1.50015 0 0 0 23.072266 4.3222656 L 8.859375 15.519531 C 7.0554772 16.941163 6 19.113506 6 21.410156 L 6 40.5 C 6 41.863594 7.1364058 43 8.5 43 L 18.5 43 C 19.863594 43 21 41.863594 21 40.5 L 21 30.5 C 21 30.204955 21.204955 30 21.5 30 L 26.5 30 C 26.795045 30 27 30.204955 27 30.5 L 27 40.5 C 27 41.863594 28.136406 43 29.5 43 L 39.5 43 C 40.863594 43 42 41.863594 42 40.5 L 42 21.410156 C 42 19.113506 40.944523 16.941163 39.140625 15.519531 L 24.927734 4.3222656 A 1.50015 1.50015 0 0 0 23.951172 4 z M 24 7.4101562 L 37.285156 17.876953 C 38.369258 18.731322 39 20.030807 39 21.410156 L 39 40 L 30 40 L 30 30.5 C 30 28.585045 28.414955 27 26.5 27 L 21.5 27 C 19.585045 27 18 28.585045 18 30.5 L 18 40 L 9 40 L 9 21.410156 C 9 20.030807 9.6307412 18.731322 10.714844 17.876953 L 24 7.4101562 z" fill={type === null  ? "#F5F5F5": "#333333"}></path>
                </svg>
                <span className={`text-normal ${type === null ? "text-[#F5F5F5]": "text-text-black-2"}`}>Home</span>
              </Link>
              <Link href="/dashboard?f=recents" className={`w-full inline-flex ${type === "recents"? "bg-normalBlueVariant": "bg-grayVariant"} flex-row items-center gap-x-3 px-4 py-2.5 rounded-lg`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g id="clock-01">
                  <path id="Vector" d="M15.2837 15.3487C15.8076 15.5234 16.3739 15.2402 16.5486 14.7163C16.7232 14.1923 16.4401 13.626 15.9161 13.4513L15.2837 15.3487ZM11.9999 13.2H10.9999C10.9999 13.6305 11.2753 14.0126 11.6837 14.1487L11.9999 13.2ZM12.9999 8.18228C12.9999 7.63 12.5522 7.18228 11.9999 7.18228C11.4476 7.18228 10.9999 7.63 10.9999 8.18228H12.9999ZM15.9161 13.4513L12.3161 12.2513L11.6837 14.1487L15.2837 15.3487L15.9161 13.4513ZM12.9999 13.2V8.18228H10.9999V13.2H12.9999ZM20.5999 12C20.5999 16.7497 16.7495 20.6 11.9999 20.6V22.6C17.8541 22.6 22.5999 17.8542 22.5999 12H20.5999ZM11.9999 20.6C7.25025 20.6 3.3999 16.7497 3.3999 12H1.3999C1.3999 17.8542 6.14568 22.6 11.9999 22.6V20.6ZM3.3999 12C3.3999 7.25037 7.25025 3.40002 11.9999 3.40002V1.40002C6.14568 1.40002 1.3999 6.14581 1.3999 12H3.3999ZM11.9999 3.40002C16.7495 3.40002 20.5999 7.25037 20.5999 12H22.5999C22.5999 6.14581 17.8541 1.40002 11.9999 1.40002V3.40002Z" fill={type === "recents" ? "#F5F5F5": "#333333"}/>
                  </g>
                </svg>

                <span className={`text-normal ${type === "recents" ? "text-[#F5F5F5]": "text-text-black-2"}`}>Recents</span>
              </Link>
              <Link href="/dashboard?f=starred" className={`w-full inline-flex ${type === "starred"? "bg-normalBlueVariant": "bg-grayVariant"} flex-row items-center gap-x-3 px-4 py-2.5 rounded-lg`}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="star-02">
                      <path id="Icon" d="M11.4951 2.71393C11.7017 2.29539 12.2985 2.29539 12.5051 2.71393L15.1791 8.13206C15.2611 8.29826 15.4196 8.41346 15.6031 8.44012L21.5823 9.30895C22.0442 9.37607 22.2286 9.94369 21.8944 10.2695L17.5678 14.4869C17.4351 14.6163 17.3745 14.8027 17.4058 14.9854L18.4272 20.9404C18.5061 21.4005 18.0233 21.7513 17.6101 21.5341L12.2621 18.7225C12.0981 18.6362 11.9021 18.6362 11.738 18.7225L6.39002 21.5341C5.97689 21.7513 5.49404 21.4005 5.57294 20.9404L6.59432 14.9854C6.62565 14.8027 6.56509 14.6163 6.43236 14.4869L2.10573 10.2695C1.7715 9.94369 1.95594 9.37607 2.41783 9.30895L8.39708 8.44012C8.5805 8.41346 8.73906 8.29826 8.82109 8.13206L11.4951 2.71393Z" stroke={type=== "starred"? "#F5F5F5": "#333333"} strokeWidth="2" strokeLinejoin="round"/>
                    </g>
                  </svg>
                <span className={`text-normal ${type === "starred" ? "text-[#F5F5F5]": "text-text-black-2"}`}>Starred</span>
              </Link>

            </div>
          </div>
            
            <div className="pt-14 px-6">
              <div className="relative">
                <span className="inline-block w-2 h-2 bg-[#006644] rounded-full absolute top-1/2 -translate-y-1/2 left-4"></span>

                <select name="loadData" onChange={fetchData} id="" ref={selectType} className="w-full text-text-black focus:border-[#CCC] border border-[#CCCCCC] py-3 px-7 rounded-xl">
                  
                  <option value="projects">Projects</option>
                  <option value="flowsheets">Flowsheets</option>
                </select>
              </div>

              <div className="py-5 px-3 flex flex-col gap-5">
                {data?.length ? data.map((item)=>{
                  const link = selectType.current.value === "projects" ? `/project/${item.id}` : `/project/${(item as fetchedFlowsheetsType).project}/flowsheet/${item.id}`
                  return (<Link href={link} key={item.id} className="flex justify-between text-[#4D4D4D]">
                    <h2>{item.name}</h2>
                    <Image src={arrowRight} height={10} width={10} alt="arrow right"/>
                  </Link>)
                }):""}
              </div>

            </div>
             
        </section>
      
    </div>
  )
}

export default DashboardSidebar

"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from "next/navigation"
import Link from 'next/link';
import Image from 'next/image';
import { fetchDashboardFlowsheets, fetchDashboardProjects, updateFlowsheet, updateProject } from '@/lib/actions/dashboard';

export type fetchedProjectType = {
    id: string,
    name: string,
    description: string,
    preview_url: string,
    background_preview_url: string, 
    get_mins_ago: string,
    starred: boolean,
    last_edited: string,
    link: string,
}

export type fetchedFlowsheetsType = fetchedProjectType & {
    project: string
}




const DashboardPageRenderer = () => {
    const currentType = useRef<string | null>(null)
    const fetchedProjects = useRef(false)
    const fetchedFlowsheets = useRef(false)
    const [flowsheets, setFlowsheets] = useState<fetchedFlowsheetsType[]>([]);
    const [projects, setProjects] = useState<fetchedProjectType[]>([])
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const type = searchParams.get("f")
    const tType = searchParams.get("t")
    // console.log("search param tType ", tType)
    const activeBtnClass = 'bg-[#17181A] text-text-gray-2 p-2 rounded-xl'
    const dormantBtnClass = 'bg-grayVariant text-text-black-2 p-2 rounded-xl'

    const buttonTitle = type === "recents" ? "Recent " : type === "starred" ? "Starred " : ""
    


    useEffect(() => {
        if (currentType.current !== type) {
            fetchedProjects.current = false
            fetchedFlowsheets.current = false
        }
        const getProjects = async () => {
            setLoading(true)
            const response = await fetchDashboardProjects(type)
            setProjects(response)
            fetchedProjects.current = true
            setLoading(false)
        }
        const getFlowsheets = async () => {
            setLoading(true)
            const response = await fetchDashboardFlowsheets(type)
            setFlowsheets(response)
            fetchedFlowsheets.current = true
            setLoading(false)
        }


        if (tType === "projects") {
            if (currentType.current === type && fetchedProjects.current) return;
            getProjects()
        } else {
            if (currentType.current === type && fetchedFlowsheets.current) return;
            getFlowsheets()
        }

        currentType.current = type
        
    }, [type, tType])
    
    return (
    <section>
        <header className='flex flex-row gap-4'>
            <Link href={`dashboard${type ? "?f="+type : ""}`} className={tType === "projects" ? dormantBtnClass : activeBtnClass}>{buttonTitle}Flowsheets</Link>
            <Link href={`dashboard${type ? "?f="+type+"&t=projects" : "?t=projects"}`} className={tType === "projects" ? activeBtnClass : dormantBtnClass}>{buttonTitle}Projects</Link>
        </header>
        <div className='pt-10'>
            <div className='flex flex-row flex-wrap gap-5 gap-y-10 w-full min-h-[25vw] content-start justify-start'>
                
                {
                    tType === "projects" && projects?.length ?
                    <CardRenderer type="projects" setData={setProjects} data={projects}/> :
                    tType !== "projects" && flowsheets?.length ? <CardRenderer type="flowsheets" setData={setFlowsheets} data={flowsheets} /> : 
                    loading ? <div>loading...</div> : <div>No {tType=== "projects" ? tType : "flowsheets"}</div>
                }
             
            </div>
        </div>
    </section>
  )
}

export default DashboardPageRenderer

type rendererPropType = {
    setData: React.Dispatch<React.SetStateAction<fetchedProjectType[]>> | React.Dispatch<React.SetStateAction<fetchedFlowsheetsType[]>>,
    type: "projects" | "flowsheets", 
    data: fetchedFlowsheetsType[] | fetchedProjectType[]
}


export const CardRenderer = ({data, setData, type}: rendererPropType) => {
    
    const starAndUnstar = (item: fetchedFlowsheetsType | fetchedProjectType) => {
        const newData = data.map(entry => {
            if (entry.id === item.id) {
                entry.starred = !item.starred
                item.starred = entry.starred
            }
            return entry
        })
        setData(newData)

        if (type === "projects") updateProject(item)
        else updateFlowsheet(item as fetchedFlowsheetsType)
    }
    return <>
        {
            data.map(item => (
                <article key={item.id} className='flex-1 min-w-[450px] max-w-[550px] aspect-[3/2]'>
                    <div className='h-[80%] relative'>
                        <div onClick={() => starAndUnstar(item)} className='absolute flex justify-center items-center cursor-pointer top-[5%] right-[5%] w-10 h-10 bg-[#006644] rounded-2xl z-20'>

                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="star-02">
                                <path id="Icon" d="M11.4951 2.71393C11.7017 2.29539 12.2985 2.29539 12.5051 2.71393L15.1791 8.13206C15.2611 8.29826 15.4196 8.41346 15.6031 8.44012L21.5823 9.30895C22.0442 9.37607 22.2286 9.94369 21.8944 10.2695L17.5678 14.4869C17.4351 14.6163 17.3745 14.8027 17.4058 14.9854L18.4272 20.9404C18.5061 21.4005 18.0233 21.7513 17.6101 21.5341L12.2621 18.7225C12.0981 18.6362 11.9021 18.6362 11.738 18.7225L6.39002 21.5341C5.97689 21.7513 5.49404 21.4005 5.57294 20.9404L6.59432 14.9854C6.62565 14.8027 6.56509 14.6163 6.43236 14.4869L2.10573 10.2695C1.7715 9.94369 1.95594 9.37607 2.41783 9.30895L8.39708 8.44012C8.5805 8.41346 8.73906 8.29826 8.82109 8.13206L11.4951 2.71393Z" stroke={"#F5F5F5"} fill={item.starred ? "#F5F5F5": ""} strokeWidth="2" strokeLinejoin="round"/>
                                </g>
                            </svg>
                        </div>

                        <div className="flowsheet-preview-wrapper">
                            <Image width={400} height={200} className='w-full h-full absolute z-1 top-0 left-0 object-con border rounded border-[#E6E6E6] bg-grayVariant' src={item.background_preview_url} alt={"preview_background"}/>
                            {
                                item.preview_url ? <Image width={400} height={200} className='w-auto h-full relative z-10 bg-transparent' src={item.preview_url} alt={item.name}/> : <></>

                            }
                            

                        </div>
                        {/* <Image width={400} height={200} className='w-full h-full object-con border rounded border-[#E6E6E6] bg-grayVariant' src={item.preview_url} alt={item.name}/> */}
                    </div>
                    <div className='h-[20%] py-4 flex justify-between'>
                        <div className='flex flex-col gap-1'>
                            <h3 className='text-[#1A1A1A] font-semibold'>{item.name}</h3>
                            <p className='text-[#4D4D4D] text-xs'>Edited {item.get_mins_ago} {item.get_mins_ago === "now" ? "" : "ago"}</p>
                        </div>
                        <div className='justify-center items-center pr-4'>
                            <Link href={`/${item.link}`}> Open &raquo;</Link>
                        </div>
                        
                    </div>
                </article>)
            )
        }
    </>
}



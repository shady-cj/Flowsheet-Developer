"use client";

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import file from "@/assets/file.svg"
import { fetchedProjectType } from './DashboardPageRenderer';
import arrowRight from "@/assets/arrow-right.svg";
import { fetchDashboardProjects } from '@/lib/actions/dashboard';
import Link from 'next/link';
import Loader from '../utils/loader';



const CreateFlowsheetCard = () => {
    const [selectProjectOpen, setSelectProjectOpen] = useState(false)
    const [projects, setProjects] = useState<fetchedProjectType[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(()=> {
        const fetchData = async () => {
            setLoading(true)
            const projects = await fetchDashboardProjects(null)
            setProjects(projects.results)
            setLoading(false)
        }
        if (selectProjectOpen){
            fetchData()
        }
    }, [selectProjectOpen])
  return (
    <div className='w-[14.5rem] relative'>
        <div onClick={()=> setSelectProjectOpen(prev=>!prev)} className='inline-flex p-4 w-full h-full flex-col cursor-pointer bg-[#E6EDFA] gap-y-3 rounded-lg'>
            <Image src={file} alt="" width={24} height={24} />
            <span className='text-text-blue-variant font-medium text-sm xl:text-base'>New Flowsheet</span>
        </div>
        {
            selectProjectOpen ? (<div className='absolute shadow-sm w-[25vw] min-h-[20vh] left-0 top-[100%] z-20 bg-white text-black rounded-xl px-4 py-6'>
                <h2 className='text-lg xl:text-xl font-semibold'>-- Choose Project --</h2> 
                <article className='py-4 flex flex-col gap-3'>
                    {
                       loading ? <Loader small={true} color='black' fullScreen={false} />: projects && projects.length ? projects.map(project => <Link key={project.id} href={`/project/${project.id}/flowsheet/create`} className='w-[90%] text-text-black-2 text-sm xl:text-base font-medium flex justify-between px-4'>
                        {project.name}
                        <Image src={arrowRight} height={10} width={10} alt="arrow right"/>
                        
                        </Link> 
                        ): ""
                    }
                    

                </article>
            </div>):""
        }
        
    </div>
  )
}

export default CreateFlowsheetCard

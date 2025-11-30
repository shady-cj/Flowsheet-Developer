"use client"
import React from 'react'
import { CardRenderer, fetchedProjectType } from './DashboardPageRenderer'
import { resultType } from './ProjectListWrapper'
import { useSearchParams, useRouter } from 'next/navigation'


const ProjectList = ({projects, revalidate, result}: {projects: fetchedProjectType[], revalidate: () => Promise<void>, result: resultType | null}) =>{
    const [projectsState, setProjectsState] = React.useState<fetchedProjectType[]>([])
    const router = useRouter()
    const searchParams = useSearchParams()
    const firstLoad = React.useRef(true)
    // console.log("projects", projects)

    const scrollOnLoad = (scrollTo: number) => {
        const container = document.getElementById("project-list__main")
        if (!container) return
        container.scrollTop = scrollTo
    }
    
    
    React.useEffect(() => {
        if (firstLoad.current) {
            if (searchParams.get("limit") || searchParams.get("offset")) {
                router.replace("/projects")
                return
            } 
        }
        const scrollTo = parseInt(searchParams.get('scroll') || '0', 10) || 0
        scrollOnLoad(scrollTo)
        setProjectsState((prev) => [...prev, ...projects])
        firstLoad.current = false
    }, [projects, searchParams, router])


   
    React.useEffect(() => {
        if (!result?.has_next) return;
        
        const container = document.getElementById("project-list__main")
        if (!container) return;

        // Handle scroll event to load more projects
        const handleScroll = () => {

            const scrollHeight = container.scrollHeight
            const scrollTop = container.scrollTop
            const clientHeight = container.clientHeight
            if (scrollTop + clientHeight + 1 >= scrollHeight) {
                if (result?.has_next) {
                    // double check
                    const nextOffset = result.offset + result.limit
                    const params = new URLSearchParams(searchParams)
                    params.set('limit', result.limit.toString())
                    params.set('offset', nextOffset.toString())
                    params.set('scroll', scrollTop.toString())
                    router.push(`?${params}`)

                }
            }

            
        }
        container.addEventListener("scroll", handleScroll)

        return () => {
            container.removeEventListener("scroll", handleScroll)
        }
    }, [result?.limit, result?.offset,result?.has_next, router, searchParams]) 
    
    
    
    
    return <div className=' flex flex-row flex-wrap gap-5 gap-y-10 w-full min-h-[50vh] content-start justify-start'>
                    
             <CardRenderer  type="projects" setData={setProjectsState} data={projectsState} revalidate={revalidate} />
                 
        </div>
    
}


export default ProjectList
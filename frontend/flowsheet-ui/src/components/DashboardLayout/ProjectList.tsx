"use client"
import React from 'react'
import { CardRenderer, fetchedProjectType } from './DashboardPageRenderer'

const ProjectList = ({projects, revalidate}: {projects: fetchedProjectType[], revalidate: () => Promise<void>}) =>{
    const [projectsState, setProjectsState] = React.useState<fetchedProjectType[]>(projects)
    React.useEffect(() => {
        setProjectsState(projects)
    }, [projects])
    return <div className='flex flex-row flex-wrap gap-5 gap-y-10 w-full min-h-[5vw] content-start justify-start'>
                    
             <CardRenderer  type="projects" setData={setProjectsState} data={projectsState} revalidate={revalidate}/>
                 
        </div>
    
}


export default ProjectList
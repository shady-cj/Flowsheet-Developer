import Project from "@/components/ProjectLayout/Project"
import ProjectProvider from "@/components/context/ProjectProvider"
const ProjectPage = ({params}: {params: {id: string}}) => {
  return (
    <ProjectProvider>
       <Project params={params}/>
    </ProjectProvider>
   
  )
}

export default ProjectPage

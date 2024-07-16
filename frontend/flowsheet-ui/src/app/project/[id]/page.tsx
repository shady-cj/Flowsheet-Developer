import Project from "@/components/ProjectLayout/Project"
const ProjectPage = ({params}: {params: {id: string}}) => {
  return (
      <Project params={params}/>
  )
}

export default ProjectPage

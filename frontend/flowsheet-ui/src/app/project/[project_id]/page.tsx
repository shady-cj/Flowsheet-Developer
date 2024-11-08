import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
const ProjectPage = async ({params}: {params: {project_id: string}}) => {
  // const projects = await fetch()
  return (
    <div>
      Project {params.project_id}
    </div>
      // <Project params={params}/>
  )
}

export default ProjectPage

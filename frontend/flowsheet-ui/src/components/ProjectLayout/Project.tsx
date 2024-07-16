"use client"
import ProjectSidebar from "./ProjectSidebar"
import Canvas from "./Canvas"

const Project = ({params}: {params: {id: string}}) => {
  return (
    <>
      <ProjectSidebar params={params} />
      <Canvas />
    </>
  )
}

export default Project

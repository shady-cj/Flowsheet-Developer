"use client"
import ProjectSidebar from "./ProjectSidebar"
import Canvas from "./Canvas"

const Project = ({params}: {params: {id: string}}) => {
  return (
    <>
      <ProjectSidebar params={params} />
      <div className="w-[70%] canvas-wrapper">
        <div className="w-full h-full overflow-scroll">
          <Canvas />
        </div>

      </div>
    </>
  )
}

export default Project

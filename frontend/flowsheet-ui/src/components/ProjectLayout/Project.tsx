"use client"
import ProjectSidebar from "./ProjectSidebar"
import Canvas from "./Canvas"

const Project = ({params}: {params: {id: string}}) => {
  return (
    <>
      <ProjectSidebar params={params} />
      <div className="w-[70%]" id="canvas-wrapper">
        <div className="w-full h-full overflow-auto scroll-smooth" id="canvas-parent-container">
          <Canvas params={params}/>
        </div>

      </div>
    </>
  )
}

export default Project

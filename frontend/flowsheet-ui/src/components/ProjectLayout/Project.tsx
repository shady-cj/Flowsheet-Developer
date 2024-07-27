"use client"
import ProjectSidebar from "./ProjectSidebar"
import Canvas from "./Canvas"
import { useContext } from "react"
import { ProjectContext } from "../context/ProjectProvider"

const Project = ({params}: {params: {id: string}}) => {
  const {canvasLoading} = useContext(ProjectContext)
  return (
    <>
      <ProjectSidebar params={params} />
      <div className="w-[70%]" id="canvas-wrapper">
        <div className={`w-full h-full ${canvasLoading? "overflow-hidden" :"overflow-auto"} scroll-smooth`} id="canvas-parent-container">
          <Canvas params={params}/>
        </div>

      </div>
    </>
  )
}

export default Project

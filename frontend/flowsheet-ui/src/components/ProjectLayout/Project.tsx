"use client"
import ProjectSidebar from "./ProjectSidebar"
import ProjectHeader from "@/components/ProjectLayout/ProjectHeader"
import Canvas from "./Canvas"
import { useContext } from "react"
import { ProjectContext } from "../context/ProjectProvider"

const Project = ({params}: {params: {id: string}}) => {
  const {canvasLoading} = useContext(ProjectContext)
  return (
    <>
      <ProjectSidebar params={params} />
      <section className="flex w-[80%] flex-col h-screen overflow-hidden">
        <ProjectHeader params={params} />
        <div id="canvas-wrapper" className="overflow-auto">
          <div className={`w-full h-full ${canvasLoading? "overflow-hidden" :"overflow-auto"} scroll-smooth`} id="canvas-parent-container">
            <Canvas params={params}/>
          </div>

        </div>
      </section>
    </>
  )
}

export default Project

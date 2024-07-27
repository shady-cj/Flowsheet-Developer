"use client"

import Link from "next/link"
import { ProjectContext } from "../context/ProjectProvider"
import { useContext } from "react"
const ProjectHeader = ({params}: {params: {id: string}}) => {
  const {saveObjectData, hasInstance} = useContext(ProjectContext)
  return (
    <header className="w-full h-28 z-10 border-b grow-1 shrink-0 basis-auto h-[20vh] bg-white">
        header files
        <button onClick={()=> saveObjectData(params.id)} className="m-2 bg-gray-100 p-2">
          {hasInstance.current ? "Update" : "Save"}
        </button>
        
    </header>
  )
}

export default ProjectHeader

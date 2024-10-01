"use client"

import Link from "next/link"
import { ProjectContext } from "../context/ProjectProvider"
import { useContext } from "react"
import Image from "next/image"
import exportImage from "@/assets/export.svg"
import arrowRight from "@/assets/arrow-right.svg"


const ProjectHeader = ({params}: {params: {id: string}}) => {
  
  const {saveObjectData, hasInstance, canvasLoading, htmlToImageConvert} = useContext(ProjectContext)
  return (
    <header className="w-full z-10 border-b border-text-gray bg-grayVariant flex justify-between items-center py-2 px-5">
        <nav className="flex gap-2 items-center">
            <Link href={"/"} className="text-base text-[#666666] font-normal">home</Link>
            <Image src={arrowRight} width={10} height={10} alt="arrow right" />
              <p>project</p>
            <button onClick={()=> saveObjectData(params.id)} className="m-2 bg-gray-100 p-2" disabled={canvasLoading}>
              {canvasLoading ? "Loading..." : (hasInstance.current ? "Update" : "Save")}
            </button>
        </nav>
        <div className="flex items-center gap-5">
          <div className="bg-[#E381E3] font-semibold text-[#261A26] text-base w-10 h-10 border border-[#CC74CC] flex items-center justify-center rounded-full" style={{boxShadow: "0px -4px 5px -2px #0000000D inset"}}>
          PE
          </div>

          <button className="bg-normalBlueVariant text-text-gray-2 py-2 px-3 flex gap-x-2 items-center rounded-lg text-base" onClick={htmlToImageConvert} disabled={canvasLoading}>
            <Image width={16} height={16} src={exportImage} alt="export" quality={100} />
            Export </button>
        </div>

        
    </header>
  )
}

export default ProjectHeader

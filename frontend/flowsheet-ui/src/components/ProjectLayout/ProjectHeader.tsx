"use client"

import Link from "next/link"
import { ProjectContext } from "../context/ProjectProvider"
import { useContext, useState } from "react"
import Image from "next/image"
import exportImage from "@/assets/export.svg"
import arrowRight from "@/assets/arrow-right.svg"
import arrowDown from "@/assets/arrow-down.svg"


const ProjectHeader = ({params}: {params: {id: string}}) => {
  const [showDropDown, setShowDropDown] = useState(false)
  const [openBondsBox, setOpenBondsBox] = useState(false)
  
  const { canvasRef,objectData, saveObjectData, hasInstance, canvasLoading, htmlToImageConvert, userObject, projectObject, calculateBondsEnergy, workIndex, Wvalue, setWvalue, communitionListForBondsEnergy} = useContext(ProjectContext)

  return (
    <>
      <header className="w-full z-10 border-b border-text-gray bg-grayVariant flex justify-between items-center py-2 px-5">
          <nav className="flex gap-2 items-center">
              <Link href={"/"} className="text-base text-[#666666] font-normal">home</Link>
              <Image src={arrowRight} width={10} height={10} alt="arrow right" />
                <p>{projectObject?.name}</p>
              <button onClick={()=> saveObjectData(params.id)} className="m-2 bg-gray-100 p-2" disabled={canvasLoading}>
                {canvasLoading ? "Loading..." : (hasInstance.current ? "Update" : "Save")}
              </button>
              <div className="flex gap-2 relative">
                <span>Utility</span> <Image src={arrowDown} width={10} height={10} alt="drop down" className="cursor-pointer" onClick={()=> setShowDropDown(!showDropDown)}/>
                <div className={`z-40 flex py-3 shadow-lg rounded-md flex-col bg-white transition-all absolute top-[200%] -left-[50%] ${showDropDown ? "opacity-100 visible" : "invisible opacity-0"}`}>
                  <span className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-[#DFE1E6]" onClick={()=> {
                    setShowDropDown(false);
                    if (!calculateBondsEnergy.current) setOpenBondsBox(true)
                  }}>{ calculateBondsEnergy.current ? "Click the communition components":
                        "Calculate Bonds Energy"}</span>
                  <span className="px-3 py-2 cursor-pointer hover:bg-[#DFE1E6]">SpreadSheet</span>
                </div>
              </div>
          </nav>
          <div className="flex items-center gap-5">
            <div className="bg-[#E381E3] font-semibold text-[#261A26] text-base w-10 h-10 border border-[#CC74CC] flex items-center justify-center rounded-full" style={{boxShadow: "0px -4px 5px -2px #0000000D inset"}}>
            {userObject?.email.substring(0, 2).toLocaleUpperCase()}
            </div>

            <button className="bg-normalBlueVariant text-text-gray-2 py-2 px-3 flex gap-x-2 items-center rounded-lg text-base" onClick={()=> htmlToImageConvert(canvasRef.current, objectData.current)} disabled={canvasLoading}>
              <Image width={16} height={16} src={exportImage} alt="export" quality={100} />
              Export </button>
          </div>

          
      </header>





      <div className={`transition-all w-screen h-screen left-0 top-0 fixed bg-[#00000080] z-50 flex justify-center items-center ${openBondsBox || Wvalue !== null ? "visible opacity-100": "invisible opacity-0"}`}>
        <div className="min-w-1/3 min-h-1/3 bg-white flex flex-col py-5 px-6 shadow-lg rounded-sm">
          <>
          <section className={`${openBondsBox ? "visible opacity-100 h-full": "invisible opacity-0 h-0"}`}>
                <div>
                  <p className="italic text-[#333]">To calculate the bond&apos;s energy between two points in a communition process here are the steps</p>
                  <h2 className="mt-4 font-bold">Steps</h2>
                  <ul className="list-disc mx-4">
                    <li>Determine the work index <a className="text-blue-300" href="https://www.researchgate.net/figure/Average-Bond-Work-Index-in-kJ-kg-for-some-minerals-and-rocks-Data-taken-from-Allis_tbl2_266501778" target="_blank">here</a></li>
                    <li>Enter the value for the work index in the input below</li>
                    <li>Click Calculate below</li>
                    <li>Click 2 different communition component, if it&apos;s just for a single communition process click the component twice</li>
                    <li>A pop up of the calculated bond&apos;s energy would show up</li>
                    <li>To close this tab without calculating the bond&apos;s energy click the Discard button</li>
                  </ul>
                  
                  <input type="number" placeholder="Work Index in kJ/Kg" className="mt-4 border border-[#DFE1E6] p-2 rounded-sm text-sm" ref={workIndex} />
                </div>
                <div className='flex justify-end gap-4 mt-3'>
                  <button className='bg-red-400 rounded-lg py-2 px-4 text-white' onClick={(e)=> {setOpenBondsBox(false)}}>Discard</button>
                  <button className='bg-[#006644] rounded-lg py-2 px-4 text-white flex items-center justify-center min-w-24' onClick={()=> {
                    calculateBondsEnergy.current = true
                    setOpenBondsBox(false)
                  }}>Calculate</button>
                </div>
          </section>
          <section className={`flex flex-col gap-3 ${Wvalue !== null ? "visible opacity-100 h-full" : "invisible opacity-0 h-0"}`}>
                {
                  communitionListForBondsEnergy.current.length && (communitionListForBondsEnergy.current[0].oid === communitionListForBondsEnergy.current[1].oid ? <h2 className="text-lg">
                    Bonds Energy summary at <b>{communitionListForBondsEnergy.current[0].label}</b> </h2> : <h2 className="text-lg">Bonds Energy summary between <b>{communitionListForBondsEnergy.current[0].label}</b> and <b>{communitionListForBondsEnergy.current[1].label}</b></h2>)
                }
                <p><b>Df</b> = <b>{communitionListForBondsEnergy.current.length && (parseFloat(communitionListForBondsEnergy.current[0].properties.gape!) * 0.8).toFixed(2)}</b></p>
                <p><b>Dp</b> = <b>{communitionListForBondsEnergy.current.length && (parseFloat(communitionListForBondsEnergy.current[1].properties.set!) * 0.8).toFixed(2)}</b></p>
                <p><b>Work Index</b> = <b>{workIndex.current && parseFloat(workIndex.current!.value)}kJ/Kg</b></p>
                <p>Energy used for communition between the two point in the circuit is <b>{Wvalue}kW h/short ton</b></p>
                <div className='flex justify-end gap-4 mt-3'>
                  <button className='bg-red-400 rounded-lg py-2 px-4 text-white' onClick={()=> {
                    communitionListForBondsEnergy.current = []
                    setWvalue(null)
                  }}>
                    Close
                  </button>
                </div>
          </section> 
        </>
          
      </div> 
     
    </div>
    </>
  )
}

export default ProjectHeader

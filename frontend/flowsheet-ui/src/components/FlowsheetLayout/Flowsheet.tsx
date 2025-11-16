"use client"
import FlowsheetSidebar from "./FlowsheetSidebar"
import FlowsheetHeader from "@/components/FlowsheetLayout/FlowsheetHeader"
import Canvas from "./Canvas"
import { useContext, useEffect } from "react"
import { FlowsheetContext } from "../context/FlowsheetProvider"
import { UserContext } from "../context/UserProvider"
import Loader from "../utils/loader"

const Flowsheet = ({params}: {params: {project_id: string, flowsheet_id: string}}) => {
  const {canvasLoading, getFlowsheet, flowsheetObject} = useContext(FlowsheetContext)
  const {loadingUser, user} = useContext(UserContext)
  useEffect(() => {
   
    getFlowsheet(params.project_id, params.flowsheet_id);
  }, [getFlowsheet, params.flowsheet_id, params.project_id])

  if (!loadingUser && user && flowsheetObject && user.id === flowsheetObject.project_creator_id) {
    return (
      <>
          <FlowsheetSidebar params={params} />
          <section className="flex w-[75%] flex-col h-screen overflow-hidden">
            <FlowsheetHeader params={params} />
            <div id="canvas-wrapper" className="overflow-auto flex-auto custom-scrollbar">
              <div className={`w-full h-full ${canvasLoading? "overflow-hidden" :"overflow-auto"} scroll-smooth custom-scrollbar`} id="canvas-parent-container">
                <Canvas params={params}/>
              </div>

            </div>
          </section>
      </>
    )
  } else if (!loadingUser && user && flowsheetObject && user.id !== flowsheetObject.project_creator_id) {
    return (
      <>
         <section className="flex w-[100%] flex-col h-screen overflow-hidden">
            <FlowsheetHeader params={params} />
            <div id="canvas-wrapper" className="overflow-auto flex-auto custom-scrollbar">
              <div className={`w-full h-full ${canvasLoading? "overflow-hidden" :"overflow-auto"} scroll-smooth custom-scrollbar`} id="canvas-parent-container">
                <Canvas params={params}/>
              </div>
            </div>
          </section>
      </>
    )
  } else {
    return <Loader fullScreen={true} color="black" small={false} />
  }
 
}

export default Flowsheet

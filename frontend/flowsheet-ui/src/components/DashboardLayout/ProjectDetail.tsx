"use client"
import React from 'react'
import { CardRenderer, fetchedFlowsheetsType } from './DashboardPageRenderer'

const ProjectDetailFlowsheets = ({flowsheets}: {flowsheets: fetchedFlowsheetsType[]}) =>{
    const [flowsheetsState, setFlowsheetsState] = React.useState<fetchedFlowsheetsType[]>(flowsheets)
    
    return <div className='flex flex-row flex-wrap gap-5 gap-y-10 w-full min-h-[5vw] content-start justify-start'>
                    
             <CardRenderer  type="flowsheets" setData={setFlowsheetsState} data={flowsheetsState}/>
                 
        </div>
    
}

export default ProjectDetailFlowsheets

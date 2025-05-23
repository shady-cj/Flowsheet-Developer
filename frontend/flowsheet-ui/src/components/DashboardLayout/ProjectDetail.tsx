"use client"
import React from 'react'
import { CardRenderer, fetchedFlowsheetsType } from './DashboardPageRenderer'

const ProjectDetailFlowsheets = ({flowsheets, revalidate}: {flowsheets: fetchedFlowsheetsType[], revalidate: () => Promise<void>}) =>{
    const [flowsheetsState, setFlowsheetsState] = React.useState<fetchedFlowsheetsType[]>(flowsheets)
    React.useEffect(() => {
        setFlowsheetsState(flowsheets)
    }, [flowsheets])
    return <div className='flex flex-row flex-wrap gap-5 gap-y-10 w-full min-h-[5vw] content-start justify-start'>
                    
             <CardRenderer  type="flowsheets" setData={setFlowsheetsState} data={flowsheetsState} revalidate={revalidate}/>
                 
        </div>
    
}


export default ProjectDetailFlowsheets

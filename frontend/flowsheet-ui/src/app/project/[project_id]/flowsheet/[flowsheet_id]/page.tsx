import Flowsheet from "@/components/FlowsheetLayout/Flowsheet"
const FlowsheetPage = ({params}: {params: {project_id:string, flowsheet_id: string}}) => {
    // console.log('params', params)
  return (
      <Flowsheet params={params}/>
  )
}

export default FlowsheetPage
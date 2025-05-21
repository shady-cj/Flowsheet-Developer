import Flowsheet from "@/components/FlowsheetLayout/Flowsheet"
const FlowsheetPage = async ({params}: {params: Promise<{project_id:string, flowsheet_id: string}>}) => {
    // console.log('params', params)
  const route_params = await params
  return (
      <Flowsheet params={{project_id: route_params.project_id, flowsheet_id: route_params.flowsheet_id}}/>
  )
}

export default FlowsheetPage
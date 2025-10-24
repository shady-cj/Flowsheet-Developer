import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/DashboardLayout/DashboardHeader"
// import DashboardSidebar from "@/components/DashboardLayout/DashboardSidebar"
import { fetchedFlowsheetsType, fetchedProjectType } from "@/components/DashboardLayout/DashboardPageRenderer";
import { createFlowsheet } from "@/lib/actions/flowsheet";
import FormCreate from "@/components/utils/formCreate";
const BASE_URL = process.env.API_URL as string





const FlowsheetCreatePage = async ({params}: {params: Promise<{project_id: string}>}) => {
    const route_params = await params
    let result: {project: string, flowsheets: fetchedFlowsheetsType[]}
          const accessToken = (await cookies()).get("access")?.value
          if (!accessToken)
              redirect("/")
          try {
              const response = await fetch(`${BASE_URL}/flowsheet_create/${route_params.project_id}`, {
                  headers: {"Authorization": `Bearer ${accessToken}`},
                //   next: {revalidate: 60} // validate atmost every minute
              })
              result = await response.json()
              // console.log("result of flowsheet create page", result)
    
          } catch (err) {
              throw err
          }
    
    const propsForFlowsheetCreation = {
        title: result.project, 
        buttonTitle: "Create Flowsheet",
        nameField: {
            labelFor: "flowsheetName",
            label: "Flowsheet Name"
        },
        descriptionField: {
            labelFor: "description",
            label: "Description"
        },
        action: createFlowsheet,
        param: {
            type: "flowsheet",
            data: result.flowsheets,
            id: route_params.project_id
        },

    }   
  return (
    
    <div className="w-screen h-screen">
      <DashboardHeader />
      <section className="py-5 pl-14">
        <FormCreate {...propsForFlowsheetCreation} />
      </section>
    </div>
  )
}

export default FlowsheetCreatePage

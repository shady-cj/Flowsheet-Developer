import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import DashboardHeader from "@/components/DashboardLayout/DashboardHeader"
import {fetchedFlowsheetsType, fetchedProjectType } from "@/components/DashboardLayout/DashboardPageRenderer";
import Image from "next/image";
import ProjectDetailFlowsheets from "@/components/DashboardLayout/ProjectDetail";
const BASE_URL = process.env.API_URL as string
const ProjectPage = async ({params}: {params: Promise<{project_id: string}>}) => {
      const route_params = await params
      let result: {project: fetchedProjectType, flowsheets: fetchedFlowsheetsType[]}
      let response;
      const accessToken = (await cookies()).get("access")?.value
      if (!accessToken)
          redirect("/")
      try {
          response = await fetch(`${BASE_URL}/projects/${route_params.project_id}`, {
              headers: {"Authorization": `Bearer ${accessToken}`},
              next: {tags: ['projects']} // revalidate when the tag is invalidated
          })
          // console.log(result.project)
      } catch (err) {
          console.log("error fetching project details", err)
          throw err
      }

      if (response.status === 200) {
          result = await response.json()
      } else if (response.status === 404) {
          notFound()
      } else {
          throw new Error("Failed to fetch project details")
      }
  
      async function revalidateProject () {
        "use server"
        revalidateTag('projects')
      }

      // async function revalidateProjectPath () {
      //   "use server"
      //   const url = `${BASE_URL}/projects/${route_params.project_id}`
      //   // revalidatePath()
      // }


  return (
    
    <div className="w-screen h-screen">
      <DashboardHeader />
      <section className="py-5">
        {
          result ? <div className="w-full">
            <div className="px-4 pb-8 border-b border-solid border-[#E6E6E6]">
              <div className="h-[75vh] flex gap-x-14">
                  <div className="project-preview-wrapper">
                      {/* <Image fill sizes="(max-width: 1600px) 100vw, 70vw" className='w-auto h-full absolute z-1 top-0 left-0 object-cover border rounded border-[#E6E6E6] bg-grayVariant' src={result.project.background_preview_url} priority alt={"preview_background"}/> */}
                      <div className='w-full h-full absolute z-1 top-0 left-0 border rounded border-[#E6E6E6] bg-grayVariant'> 
                        <div className="w-[10000px] h-[10000px]  project-flowsheet-preview-grid -translate-x-10 -translate-y-10"></div>
                      </div>
                      {
                        result.project.preview_url ? <Image fill sizes="(max-width: 1600px) 100vw, 70vw" priority className="w-auto h-full object-contain relative z-10 bg-transparent" src={result.project.preview_url} alt={result.project.name}/> : <></>
                      }
                      

                  </div>
                  {/* <Image height={200} width={560} className="w-auto h-full bg-grayVariant" src={result.project.preview_url} alt={result.project.name} /> */}
                  <div className="flex flex-col gap-4 justify-center">
                    <h2 className="text-4xl text-text-black font-bold">{result.project.name}</h2>
                    <p className="text-lg text-text-black-2 italic">
                      {result.project.description}

                    </p>
                    <p className="text-lg text-text-black-2">last edited on <em>{new Date(result.project.last_edited).toDateString()}</em></p>
                    <p className="text-lg text-text-black-2">flowsheets <em>{result.flowsheets.length}</em></p>
                  
                  </div>
              </div>
            </div>
            <div className="py-10 px-4">
              <div className="flex justify-between pr-4">
                <h1 className="text-4xl font-bold mb-6">Flowsheets</h1>
                {
                  !result.project.is_owner ? 
                  <div /> : 
                  <Link href={`/project/${route_params.project_id}/flowsheet/create`} className="text-text-blue-variant">Add new flowsheet</Link>
                }
              </div>

              {result.flowsheets.length ? <ProjectDetailFlowsheets flowsheets={result.flowsheets ?? []} revalidate={revalidateProject}/>: <div />}
            </div>


        </div> : <div />
        }
        
      </section>

    </div>
    
   
      // <Project route_params={params}/>
  )
}

export default ProjectPage

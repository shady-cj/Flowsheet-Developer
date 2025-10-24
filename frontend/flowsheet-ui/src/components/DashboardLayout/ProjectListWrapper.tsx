import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import ProjectList from "@/components/DashboardLayout/ProjectList";
import Loader from "@/components/utils/loader";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { fetchedProjectType } from "@/components/DashboardLayout/DashboardPageRenderer";

export type resultType = {
    total: number,
    has_next: boolean,
    has_previous: boolean,
    offset: number,
    limit: number,
    results: fetchedProjectType[]
}
const BASE_URL = process.env.API_URL as string

export default async function ProjectListWrapper({searchParams}: {searchParams: Promise<{ limit?: string, offset?: string, scrollTo?: string }>}) {
    let results: resultType | null = null
    let data: fetchedProjectType[] = []
    const sParams = await searchParams
    const accessToken = (await cookies()).get("access")?.value
    if (!accessToken)
        redirect("/")
    try {
        const limit = parseInt(sParams.limit || '0', 10)
        const offset = parseInt(sParams.offset || '0', 10)
        let paginate: URLSearchParams | null = new URLSearchParams()
        if ((offset === 0 && limit) || (limit && offset)){
            paginate.set('limit', limit.toString())
            paginate.set('offset', offset.toString())
        } else {
            paginate = null
        }
        const response = await fetch(`${BASE_URL}/projects${paginate ? `?${paginate.toString()}` : ''}`, {
            headers: {"Authorization": `Bearer ${accessToken}`},
            next: {tags: ['project-lists']}
        })
        results = await response.json()
        // console.log('results', results)
        if (response.status === 200) {
            data = results!.results
        } else {
            // console.log("error fetching projects", results)
            // alert("Error loading project lists")
            throw Error("Error loading project lists")
        }
        
    } catch (err) {
        throw err
    }

    async function revalidateProject () {
        "use server"

        revalidateTag('project-lists')
      
    }



    return (
    
        <section className="mt-8 flex gap-4 flex-wrap">

            {
                results && data.length ? 
                
                <Suspense fallback={<Loader color="black" fullScreen={false} offsetHeightClass="h-[300px]"/>}>
                    <ProjectList projects={data} result={results} revalidate={revalidateProject}/> 
                </Suspense> : <h1 className="font-bold text-xl">No Projects Yet...</h1>
            }
        </section>
    )
}

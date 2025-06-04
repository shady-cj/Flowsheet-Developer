import { fetchedProjectType } from "@/components/DashboardLayout/DashboardPageRenderer";
import ProjectList from "@/components/DashboardLayout/ProjectList";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
const BASE_URL = process.env.API_URL as string
export default async function Projects () {
    let results: fetchedProjectType[] | null = null
    const accessToken = (await cookies()).get("access")?.value
    if (!accessToken)
        redirect("/")
    try {
        const response = await fetch(`${BASE_URL}/projects`, {
            headers: {"Authorization": `Bearer ${accessToken}`},
            next: {tags: ['project-lists']}
        })
        results = await response.json()

    } catch (err) {
        throw err
    }

    async function revalidateProject () {
        "use server"
        console.log("revalidating project")
        revalidateTag('project-lists')
        console.log("done revalidating project")
    }
    // console.log('results', results)   
    return (
        <>
            <section className="flex w-full justify-between items-center">
                <h1 className="text-2xl font-bold">All Projects</h1>
                <Link href='/projects/create' className="bg-blueVariant text-white px-4 py-3 rounded-md shadow-md font-bold active:opacity-90 hover:bg-normalBlueVariant active:scale-90 transition mr-4"> New Project </Link>
            </section>
    
            <section className="mt-8 flex gap-4 flex-wrap">

            {
                results && results.length ? <ProjectList projects={results} revalidate={revalidateProject}/> : <h1 className="font-bold text-xl">No Projects Yet...</h1>
            }
            </section>
        </>
    )
    
}
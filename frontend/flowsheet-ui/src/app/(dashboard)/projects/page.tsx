import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
const BASE_URL = 'http://localhost:8000'
export default async function Projects () {
    let results: {id: string, name: string, creator: string, description: string}[] | null = null
    const accessToken = cookies().get("access")?.value
    if (!accessToken)
        redirect("/")
    try {
        const response = await fetch(`${BASE_URL}/projects`, {
            headers: {"Authorization": `Bearer ${accessToken}`},
            next: {revalidate: 60} // validate atmost every minute
        })
        results = await response.json()

    } catch (err) {
        throw err
    }

    return (
        <>
            <section className="flex justify-end">
                <Link href='/projects/create' className="bg-blueVariant text-white p-4 rounded-lg shadow-lg font-bold active:opacity-90 hover:bg-darkBlueVariant active:scale-90 transition"> Create New Project </Link>
            </section>
    
            <section className="mt-8 flex gap-4 flex-wrap">

            {
                results && results.length ? results.map((result) => {
                    return (<Link href={`/project/${result.id}`} key={result.id} className="bg-[#ffdda680] p-4 flex flex-col gap-y-6 flex-auto rounded-sm min-w-[30%] max-w-[40%]">
                        <h2 className="font-bold text-sm">{result.name}</h2>
                        <p className="text-xs text-gray-800">{result.description}</p>
                    </Link>)
            }): <h1 className="font-bold text-xl">No Projects Yet...</h1>
            }
            </section>
        </>
    )
    
}
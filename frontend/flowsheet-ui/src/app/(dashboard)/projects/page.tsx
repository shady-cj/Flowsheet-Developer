import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
const BASE_URL = 'http://localhost:8000/'
export default async function Projects () {
    let results: {id: string, name: string, creator: string, description: string}[] | null = null
    const accessToken = cookies().get("access")?.value
    if (!accessToken)
        redirect("/")
    try {
        const response = await fetch(`${BASE_URL}/projects`, {
            headers: {"Authorization": `Bearer ${accessToken}`}
        })
        results = await response.json()
        console.log(results)


    } catch (err) {
        throw err
    }

    return (
        <div className="flex-auto bg-white p-4">
            <section className="flex justify-end">
                <Link href='/projects/create' className="bg-blueVariant text-white p-4 rounded-lg shadow-lg font-bold active:opacity-90 hover:bg-darkBlueVariant active:scale-90 transition"> Create New Project </Link>
            </section>
    
            <section className="mt-2 flex gap-4">

            {
                results && results.length ? results.map((result) => {
                    return (<Link href={`/project/${result.id}`} key={result.id} className="bg-red-100 p-4 min-h-[10rem]">
                        <h2>{result.name}</h2>
                        <p>{result.description}</p>
                    </Link>)
            }): <h1 className="font-bold text-xl">No Projects Yet...</h1>
            }
            </section>

        </div>
    )
    
}
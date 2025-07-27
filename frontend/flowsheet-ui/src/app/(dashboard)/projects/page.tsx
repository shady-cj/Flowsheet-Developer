
import ProjectListWrapper from "@/components/DashboardLayout/ProjectListWrapper";
import Loader from "@/components/utils/loader";
import Link from "next/link";
import { Suspense } from "react";

export default async function Projects ({searchParams}: {searchParams: Promise<{ limit?: string, offset?: string, scrollTo?: string }>}) {
    
    return (
        <>
            <section className="flex w-full justify-between items-center">
                <h1 className="text-2xl font-bold">All Projects</h1>
                <Link href='/projects/create' className="hover:bg-blueVariant text-white px-4 py-3 rounded-md shadow-md font-bold active:opacity-90 bg-normalBlueVariant active:scale-90 transition mr-4"> Create New Project </Link>
            </section>
            <Suspense fallback={<Loader fullScreen={false} offsetHeightClass="h-[500px]" color="black" />}>
                <ProjectListWrapper searchParams={searchParams}/>
            </Suspense>
        </>
    )
    
}
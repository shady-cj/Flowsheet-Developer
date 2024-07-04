"use client"
import Button from "@/components/utils/Button"
import { useFormState } from "react-dom"
import { createProject } from "@/lib/actions/project"
import StatusBox from "@/components/utils/StatusBox"
import { useRef } from "react"
import { useRouter } from "next/navigation"

export default function ProjectCreate() {
    const router = useRouter()
    const [state, formAction] = useFormState(createProject, null)
    if (state?.success) {
        setTimeout(() => router.push("/projects"), 500)
        
    }
    return (
        <section className="h-full w-full flex justify-center pt-8">

            <form className="p-4 flex flex-col -ml-32 gap-y-4" action={formAction}>
                <h1 className="text-xl font-bold mb-4">Create New Project</h1>
                <section className="flex flex-col gap-y-2">
                    <label htmlFor="projectName" className="text-sm font-bold">Project Name</label>
                    <input type="text" id="projectName" name="name" className="border border-black p-2 text-sm" />
                </section>
                <section className="flex flex-col ">
                    <label htmlFor="description" className="text-sm font-bold">Description</label>
                    <textarea name="description" id="description" className="border border-black p-2 text-sm"></textarea>
                </section>
                {
                    state && <StatusBox state={state}/>
                }
                
                <Button title="Create Project"/>
            </form>
        </section>

    )
}
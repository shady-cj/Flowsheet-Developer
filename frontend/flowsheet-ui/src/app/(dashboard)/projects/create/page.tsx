import FormCreate from "@/components/utils/formCreate";
import { createProject } from "@/lib/actions/project";
import Link from "next/link";



const propsForProjectCreation = {
    title: "Create a New Project", 
    buttonTitle: "Create Project",
    nameField: {
        labelFor: "projectName",
        label: "Project Name"
    },
    descriptionField: {
        labelFor: "description",
        label: "Description"
    },
    action: createProject,
    param: null,

}
export default function ProjectCreate() {
   
    return (
        <section className="flex flex-col gap-y-4 h-full w-full px-6">
            <div className="flex justify-end w-full">
                <Link href="/projects" className="text-text-blue-variant text-lg font-medium flex flex-col hover:scale-105 transition">
                  Project List
                    <span className="inline-block border border-solid border-[#0052CC] w-[9ch] -mt-1"></span>
                </Link>
            </div>
            <FormCreate {...propsForProjectCreation} />
            
        </section>
    )
}
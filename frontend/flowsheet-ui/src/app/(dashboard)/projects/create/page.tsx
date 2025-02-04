import FormCreate from "@/components/utils/formCreate";
import { createProject } from "@/lib/actions/project";



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
        <FormCreate {...propsForProjectCreation} />
    )
}
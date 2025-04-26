"use client"
import Button from "@/components/utils/Button"
import { useFormState } from "react-dom"
import StatusBox from "@/components/utils/StatusBox"
import { useRouter } from "next/navigation"

type props = {
    title: string,
    buttonTitle: string,
    nameField: {
        labelFor: string,
        label: string
    },
    descriptionField: {
        labelFor: string,
        label: string
    },
    action: (prevState: any, formData: FormData) => Promise<any>,
    param: {
        type: string,
        data: any[],
        id: string
    } | null
    
}

const FormCreate = ({title, nameField, descriptionField, action, param, buttonTitle}: props) => {
    const router = useRouter()
    const [state, formAction] = useFormState(action, null)
    if (state?.success) {
        console.log("after submission state", state)

        if (param?.type === "flowsheet") {
            const projectId = state.result.project 
            const flowsheetId = state.result.id
            setTimeout(() => router.push(`/project/${projectId}/flowsheet/${flowsheetId}`), 500)   
        }
        else {
            const newProjectId = state.result.id        
            setTimeout(() => router.push(`/project/${newProjectId}`), 500)   
        }
    }

  return (
    <section className="px-5 h-full w-full flex justify-center items-center pt-8">

        <form className="p-4 flex flex-col gap-y-4 w-2/3" action={formAction}>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <section className="flex flex-col gap-y-4">
                <label htmlFor={nameField.labelFor} className="text-lg font-bold">{nameField.label}</label>
                <input type="text" id={nameField.labelFor} name="name" className="border border-black p-2 text-lg" />
            </section>
            <section className="flex flex-col gap-y-4 mt-4">
                <label htmlFor={descriptionField.labelFor} className="text-lg font-bold">{descriptionField.label}</label>
                <textarea name="description" id={descriptionField.labelFor} className="border border-black p-2 text-lg"></textarea>
            </section>
            {
                param && param.type == "flowsheet" ? <section  className="flex flex-col gap-y-4 mt-4">
                    <label htmlFor="footprint" className="text-lg font-bold">Flowsheet Footprint</label>
                    <select name="flowsheetFootprint" id="footprint" defaultValue={"none"} className="border border-black p-2 text-lg" >
                        <option value="none">-- Choose a footprint --</option>
                        {
                            param.data.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)
                        }
                        
                    </select>
                    <small><em>You can select a flowsheet footprint to build your new flowsheet from</em></small>
                    <input name="projectId" value={param.id} hidden/>
                </section> : ""
            }
            {
                state && <StatusBox state={state}/>
            }
            <div className="flex justify-center">
                <Button title={buttonTitle}/>

            </div>
        </form>
    </section>
  )
}

export default FormCreate

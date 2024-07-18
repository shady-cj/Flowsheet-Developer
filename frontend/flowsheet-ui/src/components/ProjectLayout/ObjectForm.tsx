import {ChangeEvent, Dispatch, FormEvent, SetStateAction} from 'react'
const ObjectForm = ({formFields, position, handleFormState, saveForm, formState}: {formFields: {type:string, htmlType: string, name: string, verboseName: string}[], position: {x: number, y: number}, handleFormState: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, saveForm: (e: FormEvent) => void, formState: {[key: string]: string}}) => {
  
    return (
    <div className="absolute w-full h-full bg-[#00000080] z-10 ">
        <div className="relative w-full h-full">
            <form action="" className={`object-form absolute bg-white p-6 flex flex-col gap-y-4`} style={{top: `${position.y}px`, left: `${position.x + 80}px`}} onSubmit={saveForm}>
                {
                    formFields.map((field)=> {

                        return (<section key={field.name} className="flex gap-2 items-center">
                            <label htmlFor={field.name}>{field.verboseName}</label>
                            {
                                field.htmlType === "input" ? <input type={field.type} id={field.name} name={field.name} className="border border-black p-2" onChange={handleFormState} value={formState[field.name]}/> : <textarea rows={4}  id={field.name} name={field.name} className="border border-black p-2" onChange={handleFormState} value={formState[field.name]}> </textarea>
                            }
                        </section>)
                    })
                }
                <button className="bg-black text-white w-fit px-4 py-2 mx-auto font-bold rounded-md">Save</button>
            </form>
        </div>  
    </div>
  )
}

export default ObjectForm

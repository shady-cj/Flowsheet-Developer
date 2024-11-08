import {ChangeEvent, Dispatch, FormEvent, SetStateAction} from 'react'
import { formStateObjectType, formFieldsType, objectType } from './Canvas'
import save from "@/assets/save.png"
import gape from "@/assets/gape.svg"
import set from "@/assets/set.svg"
import check from "@/assets/check.svg"
import Image from 'next/image'



const ObjectForm = ({formFields, position, handleFormState, saveForm, formState, objectFormType}: {formFields: formFieldsType, position: {x: number, y: number}, handleFormState: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void, saveForm: (e: FormEvent) => void, formState: formStateObjectType, objectFormType: objectType}) => {
  
    return (
    <div className="absolute w-full h-full bg-[#00000080] z-10 ">
        <div className="relative w-full h-full">
            <form action="" className={`object-form absolute bg-white p-5 pt-6 flex flex-col gap-y-6 rounded-lg max-w-[21rem]`} style={{top: `${position.y}px`, left: `${position.x + 80}px`}} onSubmit={saveForm}>
                <h2 className='text-xl text-[#1A1A1A] font-medium'>{objectFormType} Property</h2>
                {
                    formFields.map((field)=> {
                        return (
                            field.htmlType === "input" && field.name === "label" ? (<section key={field.name}>
                                <input type={field.type} id={field.name} name={field.name} className="border border-[#DFE1E6] p-2 w-full rounded-sm text-sm" onChange={handleFormState} value={formState[field.name]} placeholder={field.placeholder?field.placeholder:field.verboseName}/>
                            </section>) : ""
                        )
                    })
                }
                {

                    ["Crusher", "Grinder"].includes(objectFormType) &&
                    (<section className='flex flex-col gap-2 w-full'>
                        <h2 className='text-sm font-medium text-[#17181A]'>Gape & Set</h2>
                        <div className='flex gap-2 items-center'>
                        {

                            formFields.map((field) => {
                                return (
                                    field.name === "gape" || field.name === "set" ?
                                    (
                                        <div key={field.name} className='flex items-center gap-3 border border-[#DFE1E6] p-2 rounded-sm '>
                                            <Image src={field.name === "gape"?gape:set} alt="icon" width={20} height={20} quality={100}/>
                                            <input type={field.type} id={field.name} name={field.name} className="text-sm font-normal outline-none w-full" onChange={handleFormState} value={formState[field.name]} placeholder={field.placeholder?field.placeholder:field.verboseName}/>
                                        </div>
                                     ): ""
                                )
                            })
                        }
                        </div>
                    </section>)
                }
                {
                    objectFormType === "Crusher" && (<section className='flex flex-col gap-2'>
                        <h2 className='text-sm font-medium text-[#17181A]'>Crusher Type</h2>
                        {
                            formFields.map(field => {
                                return ( field.htmlType === "select" && field.name === "crusherType" && (
                                      <div key={field.name} className='flex gap-2'>

                                        {field.options!.map(option => {
                                            
                                            return (<div key={option.name} className={`py-1 flex-auto px-2 rounded-lg border border-[#DFE1E6] flex justify-center items-center gap-2 ${formState.crusherType === option.value ? "bg-[#006644]": ""}`}>
                                                <input type="radio" id={option.name} name={field.name} value={option.value} onChange={handleFormState} hidden/> 
                                                {formState.crusherType === option.value && <Image src={check} alt="checked" width={12} height={9} quality={100}/>}
                                                <label htmlFor={option.name} className={`text-sm text-normal cursor-pointer ${formState.crusherType === option.value ? "text-white": "text-[#333333]"}`}>{option.name}</label>
                                            </div>)
                                        })}
                                      </div>

                                    )

                                )
                            })
                        }
                        {/* field.htmlType === "select" ? 
                                <select name={field.name} id={field.name} onChange={handleFormState} className="border border-black p-2" value={formState[field.name]}>
                                    {
                                        field.options!.map((option)=> <option value={option.value} key={option.value}>{option.name}</option>)
                                    }
                                    <option value=""></option>
                                </select> : */}
                    </section>

                    )

                }
                {
                    objectFormType === "Screener" && (<section className='flex flex-col gap-2'>
                        <h2 className='text-sm font-medium text-[#17181A]'>Screener Aperture</h2>
                        {
                            formFields.map(field => {
                                return (
                                    field.name === "aperture" ?
                                    <div key={field.name} className='flex items-center gap-3 border border-[#DFE1E6] p-2 rounded-sm '>
                                        <Image src={gape} alt="icon" width={20} height={20} quality={100}/>
                                        <input type={field.type} id={field.name} name={field.name} className="text-sm font-normal w-full outline-none" onChange={handleFormState} value={formState[field.name]} placeholder={field.placeholder?field.placeholder:field.verboseName}/>
                                    </div> : ""
                                )
                            })
                        }

                    </section>

                    )

                }
                {
                    objectFormType === "Concentrator" ? (<section className='flex flex-col gap-2'>
                        <h2 className='text-sm font-medium text-[#17181A]'>Ore Quantity</h2>
                        <div className='flex gap-2 flex-wrap'>

                        {
                            formFields.map(field => {
                                return (
                                    field.name === "oreQuantity" ? 
                                    <input key={field.name} type={field.type} id={field.name} name={field.name} className="border border-[#DFE1E6] p-2 basis-[48%] flex-grow w-full rounded-sm text-sm" onChange={handleFormState} value={formState[field.name]} placeholder={field.placeholder?field.placeholder:field.verboseName}/> : ""
                                    
                                )
                            })
                        }
                        </div>


                    </section>): ""
                }
                {
                    objectFormType === "Auxilliary" && formFields.length > 4 && formFields[3].name === "oreGrade" &&  (<section className='flex flex-col gap-2'>
                        <h2 className='text-sm font-medium text-[#17181A]'>Ore Property</h2>
                        <div className='flex gap-2 flex-wrap'>

                        {
                            formFields.map(field => {
                                return (
                                    field.name === "maxOreSize" || field.name === "oreGrade" || field.name === "oreQuantity" ? 
                                    <input key={field.name} type={field.type} id={field.name} name={field.name} className="border border-[#DFE1E6] p-2 basis-[48%] flex-grow w-full rounded-sm text-sm" onChange={handleFormState} value={formState[field.name]} placeholder={field.placeholder?field.placeholder:field.verboseName}/> : ""
                                    
                                )
                            })
                        }
                        </div>


                    </section>

                    )

                }
                {
                    formFields.map((field) => {
                        return (
                            field.name === "description" ?
                            <section key={field.name}>
                                <textarea  id={field.name} name={field.name} className="border border-[#DFE1E6] p-2 w-full rounded-sm text-sm min-h-16" onChange={handleFormState} value={formState[field.name]} placeholder={field.placeholder?field.placeholder:field.verboseName}> </textarea>
                            </section> : 
                            ""
                        )
                        
                    })
                }
                              {/* field.htmlType === "select" ? 
                                <select name={field.name} id={field.name} onChange={handleFormState} className="border border-black p-2" value={formState[field.name]}>
                                    {
                                        field.options!.map((option)=> <option value={option.value} key={option.value}>{option.name}</option>)
                                    }
                                    <option value=""></option>
                                </select> : */}
                                
                                
                            
                <div className='flex justify-end'>
                    <button className="bg-[#0052CC] flex items-center text-[#F4F5F7] w-fit px-4 py-2 rounded-lg gap-2 text-base font-normal">Save <Image src={save} alt="save" quality={100} width={16} height={16}/></button>
                </div>

            </form>
        </div>  
    </div>
  )
}

export default ObjectForm

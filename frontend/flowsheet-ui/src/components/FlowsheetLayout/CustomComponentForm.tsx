"use client"
import Image from 'next/image'
import React, { DragEvent, FormEvent,useState, useEffect, useRef } from 'react'
import dropIcon from "@/assets/dropIcon.svg"
import { createCustomComponent } from '@/lib/actions/flowsheetsidebar'
import StatusBox from '../utils/StatusBox'
import { loadComponentType, objectStringType } from './FlowsheetSidebar'


const CustomComponentForm = ({setAddCustomComponent, setLoadComponent}: {setAddCustomComponent: React.Dispatch<React.SetStateAction<boolean>>, setLoadComponent: React.Dispatch<React.SetStateAction<{status: boolean, type: loadComponentType}>>}) => {
    const [preview, setPreview] = useState<ArrayBuffer| string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [uploadingComponent, setUploadingComponent] = useState(false)
    const [status, setStatus] = useState<{error: string} | {success: string} | null>(null)
    const [showDescription, setShowDescription] = useState(false)
    const [isAuxilliary, setIsAuxilliary] = useState(false)
    const [isConcentration, setIsConcentration] = useState(false)
    const dropArea = useRef<HTMLDivElement>(null!)
    const labelInput = useRef<HTMLInputElement>(null!)
    const categoryInput = useRef<HTMLSelectElement>(null!)
    const descriptionInput = useRef<HTMLInputElement | null>(null)
    const auxilliaryType = useRef<HTMLSelectElement | null>(null)
    const gangueCriteria = useRef<HTMLInputElement | null>(null)
    const valuableCriteria = useRef<HTMLInputElement | null>(null)


    const checkSelectedCategory = () => {
        const category = categoryInput.current.value
        if (category  === "concentrators" || category  === "auxilliary") setShowDescription(true)
        else setShowDescription(false)

        if (category === "auxilliary") setIsAuxilliary(true)
        else setIsAuxilliary(false)

        if (category === "concentrators") setIsConcentration(true)
        else setIsConcentration(false)
    }

    if (!uploadingComponent && status) {
        setTimeout(()=> {
            setStatus(null)
            if ("success" in status) {
                const category = categoryInput.current.value as objectStringType
                setLoadComponent({status: true, type: category as loadComponentType})
                setAddCustomComponent(false)
            }
        }, 3000)
        
    }
    const handleFormSubmit = async (e: React.SyntheticEvent) =>{
        e.preventDefault()
        setUploadingComponent(true)
        const formData = new FormData();
        if (!labelInput.current.value || !categoryInput.current.value) {
            alert("All information are required")
            return;
        }
        if (!file) {
            alert("add an image to the component")
            return;
        } 
        if (showDescription && !descriptionInput.current?.value) {
            alert("Description is required for the Component")
            return
        }
        if (isAuxilliary && !auxilliaryType.current?.value) {
            alert("Add a type for the auxilliary component")
            return;
        } 
        if (isConcentration){
            if (!gangueCriteria.current?.value || !valuableCriteria.current?.value) {
                alert("Specify the recovery criteria for the concentration technique")
                return;
            }
            if (isNaN(Number(gangueCriteria.current?.value)) || isNaN(Number(valuableCriteria.current?.value))) {
                alert("gangue and valuable recovery criteria must be valid numbers")
                return;
            }
            if (Number(gangueCriteria.current?.value) < 0 || Number(gangueCriteria.current?.value) > 100) {
                alert("gangue criteria must be within 0-100%")
                return;
            }
            if (Number(valuableCriteria.current?.value) < 0 || Number(valuableCriteria.current?.value) > 100) {
                alert("valuable criteria must be within 0-100%")
                return;
            }
        }
        
        formData.append("name", labelInput.current.value)
        formData.append("image", file)
        if (auxilliaryType.current?.value) formData.append("type", auxilliaryType.current?.value)
        if (descriptionInput.current?.value) formData.append("description", descriptionInput.current?.value)
        if (isConcentration) {
            formData.append("gangue_recoverable", Number(gangueCriteria.current!.value).toFixed(1))
            formData.append("valuable_recoverable", Number(valuableCriteria.current!.value).toFixed(1))
        }
        
        const result = await createCustomComponent(formData, categoryInput.current.value)
        setUploadingComponent(false)
        setStatus(result)

    }

    const handleFile = (file: File) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onloadend = () => {
            setPreview(reader.result)
        }
    }
    const handleFileChange = (e: FormEvent<HTMLInputElement>) => {
        const files = (e.target as HTMLInputElement).files as FileList
        setFile(files[0])
        handleFile(files[0])
       
    }
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        handleDragAway(e)
        const dt = e.dataTransfer as DataTransfer
        const files = dt.files
        if (["image/png", "image/jpeg", "image/jpg"].includes(files[0].type)) {
            setFile(files[0])
            handleFile(files[0])
        }   
    }
    const stopDefault = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }
    const handleDragInto = (e: DragEvent<HTMLDivElement>) => {
        stopDefault(e)
        dropArea.current.classList.add("border-black")
        dropArea.current.classList.add("scale-105")
    }
    const handleDragAway = (e: DragEvent<HTMLDivElement>) => {
        stopDefault(e)
        dropArea.current.classList.remove("border-black")
        dropArea.current.classList.remove("scale-105")
    }


   
  return (
    <section className="w-screen h-screen left-0 top-0 fixed bg-[#00000080] z-50 flex justify-center items-center">
           <div className="bg-white w-1/3 max-h-[80%] shadow-lg rounded-md">
                <div className="py-6 px-5">
                    <h2 className="text-xl text-[#1A1A1A] font-medium">
                        Custom Component
                    </h2>
                    <form className="pt-8 flex flex-col gap-y-6" onSubmit={handleFormSubmit}>
                        <input type="text" placeholder="Component Label" className="border border-[#DFE1E6] p-2 w-full rounded-sm text-sm " ref={labelInput}/>
                        <select name="category" id="category" className="border border-[#DFE1E6] p-2 w-full rounded-sm text-sm" ref={categoryInput}  onChange={checkSelectedCategory}>
                            <option value="grinders">Grinder</option>
                            <option value="crushers">Crusher</option>
                            <option value="screeners">Screener</option>
                            <option value="concentrators">Concentrator</option>
                            <option value="auxilliary">Auxilliary</option>
                        </select>
                        {
                            showDescription && <input type="text" placeholder="Description of the component" className="border border-[#DFE1E6] p-2 w-full rounded-sm text-sm " ref={descriptionInput}/>
                        }
                        {
                            isAuxilliary && <select name="type" id="type" className="border border-[#DFE1E6] p-2 w-full rounded-sm text-sm" ref={auxilliaryType}>
                                <option value="ORE">ore</option>
                                <optgroup label="STORAGE FACILITY" >
                                    <option value="STOCKPILE">stockpile</option>
                                    <option value="BINS">bins</option>
                                </optgroup>
                                <option value="TAILING FACILITY">Tailing Facility</option>
                                <option value="OTHERS">others</option>
                            </select>
                        }
                        {
                            isConcentration ? <section className='flex flex-col gap-2'>
                                <h2 className='font-semibold'>Recovery Criteria</h2>
                                <div className='w-full flex gap-4'>
                                    <input type="number" placeholder="valuable (%)" className="border border-[#DFE1E6] p-2 flex-1 rounded-sm text-sm " ref={valuableCriteria} min={1} max={100}/>
                                    <input type="number" placeholder="gangue (%)" className="border border-[#DFE1E6] p-2 flex-1 rounded-sm text-sm " ref={gangueCriteria} min={1} max={100}/>
                                </div>
                                
                            </section>: ""
                        }
                        
                        {
                            preview ? <div className='flex gap-4'>
                                <Image src={preview as string} width={70} height={50} className='h-auto' alt="image preview" quality={100} /> 
                                <p className='text-sm cursor-pointer' onClick={() => setPreview(null)}>remove</p>
                                </div>
                                : <div onDragEnter={handleDragInto} onDragOver={handleDragInto} onDragLeave={handleDragAway} onDrop={handleDrop} className="border border-dashed rounded-md border-[#DFE1E6] h-32 w-full flex flex-col items-center justify-center transition-all gap-4" ref={dropArea}>
                            <input type="file" accept="image/jpeg, image/jpg, image/png" hidden id="custom-component-img" onChange={handleFileChange}/>
                            <Image src={dropIcon} height={24} width={24} alt="drop icon" quality={100} />
                            <label htmlFor="custom-component-img" className="text-lg italic text-[#B3B3B3] font-normal cursor-pointer">Click to add or Drop Component Image here</label>
                        </div>
                        }
                        
                        <div className='flex justify-end gap-4 mt-3'>
                            <button className='bg-red-400 rounded-lg py-2 px-4 text-white' onClick={(e)=> {e.preventDefault(); setAddCustomComponent(false)}}>Discard</button>
                            <button className='bg-[#006644] rounded-lg py-2 px-4 text-white flex items-center justify-center min-w-24' disabled={uploadingComponent}>
                                {
                                    uploadingComponent ? <svg aria-hidden="true" role="status" className="inline w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                                    </svg> : "Create"
                                }
                            </button>
                        </div>
                        <div>
                            {
                                status && <StatusBox state={status}/>
                            }
                        </div>

                    </form>
                </div>
           </div>
    </section>
  )
}

export default CustomComponentForm

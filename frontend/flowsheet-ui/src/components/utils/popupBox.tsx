"use client"
import cancel from "@/assets/cancel.svg"
import Image from "next/image"
import { ChangeEvent, Dispatch, SetStateAction } from "react"
import { editType } from "../DashboardLayout/DashboardPageRenderer"
import { editEntity } from "@/lib/actions/dashboard"
const fieldBoxStyles = "w-full border border-black rounded-sm px-2 py-1 rounded-md"
export const EditFlowsheetOrProject = ({setEditBoxOpened, editData, setEditData, revalidate}: {setEditBoxOpened: Dispatch<SetStateAction<boolean>>,editData: editType, setEditData: Dispatch<SetStateAction<editType>>, revalidate: () => Promise<void>}) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditData({...editData, [e.target.name]: e.target.value })
    }
    const handleEdit = async () => {
        if (editData.name.trim().length < 3 || editData.description.trim().length < 5) {
            alert("Names or Description is too short")
            return
        }
        const result = await editEntity(editData)
        alert(result.message)
        if (result.success) {
            revalidate()
            setEditBoxOpened(false)
        }
    
    }
    return <div className='fixed top-0 left-0 z-30 w-screen h-screen bg-[rgba(0,0,0,0.2)] flex items-center justify-center'>
    
        <div className="relative w-[500px] px-8 py-6 flex flex-col gap-4 bg-white shadow-md rounded-md">
            <h3 className="font-semibold text-2xl mt-4 mb-4 text-center">Edit {editData.title}</h3>
            <Image src={cancel} alt="cancel" width={28} height={28} className="absolute right-5 mt-4 cursor-pointer" onClick={() => setEditBoxOpened(false)}/>
            <section>
                <input type="text" name="name" className={fieldBoxStyles} value={editData.name} onChange={handleChange}/>
            </section>
            <section>
                <textarea rows={4} cols={4} className={fieldBoxStyles} name="description" value={editData.description} onChange={handleChange}/>
            </section>
            <div className="flex justify-center items-center">
                
                <button onClick={handleEdit} className="bg-blueVariant text-white text-lg w-fit px-4 py-1 rounded-md active:bg-darkBlueVariant transition">
                    Edit
                </button>
            </div>
        </div>
    </div>
}
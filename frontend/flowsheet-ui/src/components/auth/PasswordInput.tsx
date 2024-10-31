"use client";
import { useState } from "react";
import Image from "next/image";
import hide from "@/assets/hidden.png";
import eye from "@/assets/eye.png";


const PasswordInput = ({id, name, placeholder}: {id: string, name:string, placeholder: string}) => {
  const [hidden, setHidden] = useState(true)
  return (
    <>
        <section className="relative">
            <input type={hidden?"password":"text"} id={id} placeholder={placeholder} className="py-3 px-4 rounded-lg border border-[#C7CFD6] text-sm text-[#808080] font-normal min-w-[20rem] bg-transparent" name={name} required/>
            <Image src={hidden?hide:eye} onClick={()=>setHidden(!hidden)} alt="password" className="cursor-pointer absolute top-1/2 -translate-y-1/2 right-4" width={16} height={16}/>
        </section>

    </>
  )
}

export default PasswordInput

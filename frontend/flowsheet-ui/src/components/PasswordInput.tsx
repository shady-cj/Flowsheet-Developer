"use client";
import { useState } from "react";
import Image from "next/image";
import hide from "@/assets/hidden.png";
import eye from "@/assets/eye.png";

const PasswordInput = ({id, name}: {id: string, name:string}) => {
    const [hidden, setHidden] = useState(true)
  return (
    <>
        <section className="relative bg-red-100">
            <input type={hidden?"password":"text"} id={id} className="w-full p-2 bg-gray-100 text-sm" name={name}/>
            <Image src={hidden?hide:eye} onClick={()=>setHidden(!hidden)} alt="password" className="cursor-pointer absolute top-1/2 -translate-y-1/2 right-4" width={16} height={16}/>
        </section>

    </>
  )
}

export default PasswordInput

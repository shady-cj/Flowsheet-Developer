"use client";
import Link from "next/link"
import {useState, useEffect} from 'react'
import { fetchObjects } from "@/lib/actions/projectsidebar";
import Image from "next/image";

import ConvertStringToShape from "../Shapes/ConvertStringToShape";

type genericImageObjectType = {
    id: string, 
    creator: string, 
    image: string,
    image_url: string,
    name: string
}[]

const ProjectSidebar = ({params}: {params: {id: string}}) => {
    const [shapes, setShapes] = useState<{name: string, id: string}[]>([])
    const [crushers, setCrushers] = useState<genericImageObjectType>([])
    const [screeners, setScreeners] = useState<genericImageObjectType>([])
    const [grinders, setGrinders] = useState<genericImageObjectType>([])

    useEffect(()=> {
        // fetching for Shapes, Grinder, Crusher, Concentrators, Auxilliary.
        // """
        // /shapes
        // /screeners
        // /crushers
        // /grinders
        // /concentrators
        // /auxilliary
        // """
        
        const fetchObj = async () => {
            setShapes(await fetchObjects("shapes"))
            setCrushers(await fetchObjects('crushers'))
            setGrinders(await fetchObjects("grinders"))
            setScreeners(await fetchObjects("screeners"))
            
        }
        fetchObj()

    }, [])
  return (
    <div className="w-[30%] bg-white overflow-y-auto">
        <section className="w-full flex flex-col mt-4 gap-4">
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Shapes</h1>
                <div className="flex gap-4 items-center flex-wrap mb-2">
                    {

                        shapes.length > 0 ? shapes.map((shape) => {
                                return <ConvertStringToShape key={shape.id} objectType={"Shape"} objectId={shape.id} objectName={shape.name}/>
                            }):"Loading"
                    }

                    {/* <Circle />
                    <Rectangle />
                    <Square/>
                    <Ellipse/>
                    <Triangle/>
                    <Text/>
                    <Line /> */}
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Crushers</h1>
                <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        crushers.length > 0 ? crushers.map(crusher=>{
                            return (<div className="flex flex-col justify-between items-center gap-2" key={crusher.id}>
                                <div className="relative">
                                    <Image width={50} height={50} src={crusher.image_url} alt="" className="w-[50px] h-auto"/>
                                </div>
                                <p className="text-sm font-bold">{crusher.name}</p>
                            </div>)
                        }): "Loading"
                    }
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Grinders</h1>
                <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        grinders.length > 0 ? grinders.map(grinder=>{
                            return (<div className="flex flex-col justify-between items-center gap-2" key={grinder.id}>
                                <div className="relative">
                                    <Image width={50} height={50} src={grinder.image_url} alt="" className="w-[50px] h-auto"/>
                                </div>
                                <p className="text-sm font-bold">{grinder.name}</p>
                            </div>)
                        }): "Loading"
                    }
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Screeners</h1>
                <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        screeners.length > 0 ? screeners.map(screener=>{
                            return (<div className="flex flex-col justify-between items-center gap-2" key={screener.id}>
                                <div className="relative">
                                    <Image width={50} height={50} src={screener.image_url} alt="" className="w-[50px] h-auto"/>
                                </div>
                                <p className="text-sm font-bold">{screener.name}</p>
                            </div>
                            )
                        }): "Loading"
                    }
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold">Concentration Technniques</h1>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold">Auxilliary Facilities and Materials</h1>
            </div>
            <div>
                <h1 className="text-xl font-bold px-4 py-2">Personalized Objects</h1>
            </div>
        </section>
      
    </div>
  )
}

export default ProjectSidebar

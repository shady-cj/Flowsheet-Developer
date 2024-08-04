"use client";
import Link from "next/link"
import {useState, useEffect} from 'react'
import { fetchObjects } from "@/lib/actions/projectsidebar";
import Image from "next/image";
import Crusher from "../Objects/Crusher";
import Grinder from "../Objects/Grinder";
import Screener from "../Objects/Screener";
import Auxilliary from "../Objects/Auxilliary";


import ConvertStringToShape from "../Shapes/ConvertStringToShape";

export type genericImageObjectType = {
    id: string, 
    creator?: string, 
    image?: string,
    image_url?: string,
    name: string
}

export interface AuxilliaryImageObjectType extends genericImageObjectType {
    description?: string,
    type?: string

}

const ProjectSidebar = ({params}: {params: {id: string}}) => {
    const [shapes, setShapes] = useState<{name: string, id: string}[]>([])
    const [crushers, setCrushers] = useState<genericImageObjectType[]>([])
    const [screeners, setScreeners] = useState<genericImageObjectType[]>([])
    const [grinders, setGrinders] = useState<genericImageObjectType[]>([])
    const [auxilliaries, setAuxilliaries] = useState<AuxilliaryImageObjectType[]>([])

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
            setAuxilliaries(await fetchObjects("auxilliary"))
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
                            return (<Crusher key={crusher.id} crusher={crusher} />)
                        }): "Loading"
                    }
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Grinders</h1>
                <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        grinders.length > 0 ? grinders.map(grinder=>{
                            return (<Grinder key={grinder.id} grinder={grinder}/>)
                        }): "Loading"
                    }
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Screeners</h1>
                <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        screeners.length > 0 ? screeners.map(screener=>{
                            return ( <Screener key={screener.id} screener={screener}/>
                            )
                        }): "Loading"
                    }
                </div>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold">Concentration Technniques</h1>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Auxilliary Facilities and Materials</h1>
                <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        auxilliaries.length > 0 ? auxilliaries.map(auxilliary=>{
                            return ( <Auxilliary key={auxilliary.id} auxilliary={auxilliary}/>
                            )
                        }): "Loading"
                    }
                </div>
            </div>
            <div>
                <h1 className="text-xl font-bold px-4 py-2">Personalized Objects</h1>
            </div>
        </section>
      
    </div>
  )
}

export default ProjectSidebar

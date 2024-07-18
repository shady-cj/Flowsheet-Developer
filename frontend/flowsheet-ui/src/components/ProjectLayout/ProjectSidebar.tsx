"use client";
import Link from "next/link"
import {useState, useEffect} from 'react'
import { fetchObjects } from "@/lib/actions/projectsidebar";

import ConvertStringToShape from "../Shapes/ConvertStringToShape";

const ProjectSidebar = ({params}: {params: {id: string}}) => {
    const [shapes, setShapes] = useState<{name: string, id: string}[]>([])

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
        }
        fetchObj()

    }, [])
  return (
    <div className="w-[30%] bg-white">
        <section className="w-full flex flex-col mt-4 gap-4">
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Shapes</h1>
                <div className="flex gap-4 items-center flex-wrap ">
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
                <h1 className="text-xl font-bold">Crushers</h1>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold">Grinders</h1>
            </div>
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold">Screeners</h1>
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

"use client";
import Link from "next/link"
import {useState} from 'react'
import Circle from "../Shapes/Circle";
import Rectangle from "../Shapes/Rectangle";
import Square from "../Shapes/Square";
import Ellipse from "../Shapes/Ellipse";
import Triangle from "../Shapes/Triangle";
const ProjectSidebar = ({params}: {params: {id: string}}) => {

  
  return (
    <div className="w-[30%] bg-white">
        <section className="w-full flex flex-col mt-4 gap-4">
            <div className="border-b px-4 py-2">
                <h1 className="text-xl font-bold mb-2">Shapes</h1>
                <div className="flex gap-x-4 items-center">
                    <Circle />
                    <Rectangle />
                    <Square/>
                    <Ellipse/>
                    <Triangle/>
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

"use client";
import Link from "next/link"
import {useState, useEffect, MouseEvent} from 'react'
import { fetchObjects } from "@/lib/actions/projectsidebar";
import Image, { StaticImageData } from "next/image";
import Crusher from "../Objects/Crusher";
import Grinder from "../Objects/Grinder";
import Screener from "../Objects/Screener";
import Auxilliary from "../Objects/Auxilliary";
import mineflo from "@/assets/mineflo-full.svg"
import search from "@/assets/search.svg"
import menu from "@/assets/menu.svg"
import arrowDown from "@/assets/arrow-down.svg"
import arrowUp from "@/assets/arrow-up.svg"
// import screenerImage from "@/assets/screener.png"
// import crusherImage from "@/assets/crusher.png"
// import grinderImage from "@/assets/coner.png"
// import auxilliaryImage from "@/assets/ores.png"
import screenerImage from "@/assets/screener.svg"
import crusherImage from "@/assets/crusher.svg"
import grinderImage from "@/assets/grinder.svg"
import auxilliaryImage from "@/assets/auxilliary.svg"



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
const components: {name: string, image: StaticImageData}[] = [{name: "Crushers", image: crusherImage}, {name: "Grinders",image: grinderImage}, {name: "Screeners", image: screenerImage}, {name: "Auxilliaries", image: auxilliaryImage}]



const ProjectSidebar = ({params}: {params: {id: string}}) => {
    const [shapes, setShapes] = useState<{name: string, id: string}[]>([])
    const [crushers, setCrushers] = useState<genericImageObjectType[]>([])
    const [screeners, setScreeners] = useState<genericImageObjectType[]>([])
    const [grinders, setGrinders] = useState<genericImageObjectType[]>([])
    const [auxilliaries, setAuxilliaries] = useState<AuxilliaryImageObjectType[]>([])

    const [activeComponent, setActiveComponent] = useState<{properties: genericImageObjectType[] | AuxilliaryImageObjectType[],  type: string}>({properties: [], type: ""})

    const [standardOpen, setStandardOpen] = useState<Boolean>(true)
    const [componentOpen, setComponentOpen] = useState<Boolean>(true)
    const [customObjectOpen, setCustomObjectOpen] = useState<Boolean>(true)

    const handleComponentSwitch = (e: MouseEvent<HTMLDivElement>) => {
        const element = e.target as HTMLDivElement
        const componentProperty =  element.ariaLabel === "Crushers" ? crushers :
        element.ariaLabel === "Screeners" ? screeners :
        element.ariaLabel === "Grinders" ? grinders:
        element.ariaLabel === "Auxilliaries" ? auxilliaries : []
        setActiveComponent({properties: componentProperty, type: element.ariaLabel || ""})

    }

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
    <div className="w-[20%] bg-white overflow-y-auto pt-6 pl-6 pb-5 pr-4 flex flex-col gap-y-10 border-r border-[#DFE1E6] border-solid">
        <header>
            <Image width={88} height={29} src={mineflo} alt="mineflo" quality={100} loading="lazy"/>
        </header>
        <section>
            <div className="border border-[#DFE1E6] rounded-lg p-2 flex gap-x-2">
                <label htmlFor="search-components" className="flex justify-center items-center">
                    <Image className="cursor-pointer" width={14} height={14} src={search} alt="search" quality={100}/>
                </label>
                <input type="text" id="search-components" className="border-0 outline-none text-[#B3B3B3]" placeholder="Search Components"/>
            </div>
        </section>
        <section className="w-full flex flex-col gap-4">
            <div className="border-b flex flex-col gap-y-5 pb-6">
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-2">
                        <Image width={12} height={12} src={menu} alt="vector" quality={100}/>
                        <h2 className="text-md font-medium text-text-black">Standard</h2>
                    </div>
                    
                    <Image className="cursor-pointer" width={12} height={12} src={standardOpen?arrowUp:arrowDown} onClick={() => setStandardOpen(!standardOpen)} alt="vector" quality={100}/>
                </div>
                <div className={`flex gap-5 items-center flex-wrap mb-2 overflow-hidden ${!standardOpen ? "hide-components": ""}`}>
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
            <div className="border-b flex flex-col gap-y-5 pb-6 pt-4">
                
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-2">
                        <Image width={12} height={12} src={menu} alt="vector" quality={100}/>
                        <h2 className="text-md font-medium text-text-black">Components</h2>
                    </div>
                    
                    <Image className="cursor-pointer" width={12} height={12} src={componentOpen?arrowUp:arrowDown} onClick={() => setComponentOpen(!componentOpen)} alt="vector" quality={100}/>
                </div>
                <div className={`flex gap-2 flex-wrap overflow-hidden ${!componentOpen ? "hide-components": ""}`}>
                    {
                        activeComponent.properties.length ? <section className="flex flex-col gap-y-4 overflow-hidden">
                            <h2 className="font-medium text-text-black text-base border-b py-2 flex gap-2 items-center mx-2">
                                <span className="cursor-pointer text-text-black" onClick={()=> setActiveComponent({properties: [], type: ""})}>&laquo;</span>

                                {activeComponent.type === "Auxilliaries" ? "Auxilliary Components" : activeComponent.type}</h2>
                            <div className="flex flex-wrap gap-5 overflow-hidden p-2">
                            {
                                activeComponent.properties.map(component => {
                        
                                    const componentElement = activeComponent.type === "Crushers" ? <Crusher key={component.id} crusher={component} /> : 
                                    activeComponent.type === "Grinders" ? <Grinder key={component.id} grinder={component}/> : 
                                    activeComponent.type === "Screeners" ? <Screener key={component.id} screener={component}/> : 
                                    activeComponent.type === "Auxilliaries" ? <Auxilliary key={component.id} auxilliary={component} /> : <></>
                                    return componentElement
                                }) 
                            }
                            </div>
                        </section>: components.map(c => {
                            return <div key={c.name} aria-label={c.name} onClick={handleComponentSwitch} className="border border-solid border-[#DFE1E6] p-3 flex flex-col items-center gap-y-2 rounded-lg flex-auto cursor-pointer">
                            <Image width={24} height={24} src={c.image} alt={c.name} quality={100} className="pointer-events-none"/>    
                            <h2 className="text-black-2 text-sm font-md pointer-events-none">{c.name}</h2>
                            </div>
                        })
                    }
                    
                </div>
                {/* <div className="flex gap-x-6 gap-y-2 flex-wrap mb-2">
                    {
                        crushers.length > 0 ? crushers.map(crusher=>{
                            return (<Crusher key={crusher.id} crusher={crusher} />)
                        }): "Loading"
                    }
                </div> */}
            </div>
            {/* <div className="border-b px-4 py-2">
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
            </div> */}
            <div className="flex flex-col gap-y-5 pt-4">
            <div className="flex justify-between items-center">
                    <div className="flex gap-x-2">
                        <Image width={12} height={12} src={menu} alt="vector" quality={100}/>
                        <h2 className="text-md font-medium text-text-black">Personalized Objects</h2>
                    </div>
                    
                    <Image className="cursor-pointer" width={12} height={12} src={customObjectOpen?arrowUp:arrowDown} onClick={() => setCustomObjectOpen(!customObjectOpen)} alt="vector" quality={100}/>
                </div>
            </div>
        </section>
      
    </div>
  )
}

export default ProjectSidebar

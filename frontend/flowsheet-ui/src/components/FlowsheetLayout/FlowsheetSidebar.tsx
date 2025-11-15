"use client";
import Link from "next/link"
import {useState, useEffect, MouseEvent, useContext} from 'react'
import CustomComponentForm from "./CustomComponentForm";
import { FlowsheetContext } from "../context/FlowsheetProvider"
import { fetchObjects, removeObject } from "@/lib/actions/flowsheetsidebar";
import Image, { StaticImageData } from "next/image";
import Logo from "../Logo";
import trash from "@/assets/trash.svg"
import logoIcon from "@/assets/logo-icon.svg"
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
import importComponent from "@/assets/dropZone.svg"
import concentratorImage from "@/assets/concentrator.svg"



import ConvertStringToShape from "../Shapes/ConvertStringToShape";
import Concentrator from "../Objects/Concentrator";
import Loader from "../utils/loader";
import { UserContext } from "../context/UserProvider";

export type genericImageObjectType = {
    id: string, 
    creator?: string, 
    image_url?: string,
    image_height?: number,
    image_width?: number,
    name: string
}

export interface AuxilliaryImageObjectType extends genericImageObjectType {
    description?: string,
    type?: string

}

export interface ConcentratorImageObjectType extends genericImageObjectType {
    description?: string,
    valuable_recoverable: number,
    gangue_recoverable: number,
}
 
export type objectStringType = 'Shape' | 'Concentrator' | 'Grinder' | 'Auxilliary' | 'Crusher' | 'Screener'

const mappedObjectType = {
    "Shape": "shapes",
    "Concentrator": "concentrators",
    "Grinder": "grinders",
    "Auxilliary": "auxilliary",
    "Crusher": "crushers",
    "Screener": "screeners"
}

const components: {name: string, image: StaticImageData}[] = [{name: "Crushers", image: crusherImage}, {name: "Grinders",image: grinderImage}, {name: "Screeners", image: screenerImage}, {name: "Auxilliaries", image: auxilliaryImage}, {name: "Concentrators", image: concentratorImage}]
export type loadComponentType = "" | "crushers" | "concentrators" | "screeners" | "shapes" | "auxilliary" | "grinders"


const FlowsheetSidebar = ({params}: {params: {project_id: string, flowsheet_id: string}}) => {
    const {isEdited} = useContext(FlowsheetContext)
    const [shapes, setShapes] = useState<{name: string, id: string}[]>([])
    const [crushers, setCrushers] = useState<genericImageObjectType[]>([])
    const [screeners, setScreeners] = useState<genericImageObjectType[]>([])
    const [grinders, setGrinders] = useState<genericImageObjectType[]>([])
    const [concentrators, setConcentrators] = useState<ConcentratorImageObjectType[]>([])
    const [auxilliaries, setAuxilliaries] = useState<AuxilliaryImageObjectType[]>([])
    const [addCustomComponent, setAddCustomComponent] = useState(false)
    const [loadComponent, setLoadComponent] = useState<{status: boolean, type: loadComponentType}>({status: true, type: ""})
    const {user} = useContext(UserContext)


    const [activeComponent, setActiveComponent] = useState<{properties: genericImageObjectType[] | AuxilliaryImageObjectType[] | ConcentratorImageObjectType[],  type: string}>({properties: [], type: ""})

    const [standardOpen, setStandardOpen] = useState<Boolean>(true)
    const [componentOpen, setComponentOpen] = useState<Boolean>(true)
    const [customObjectOpen, setCustomObjectOpen] = useState<Boolean>(true)

    const handleComponentSwitch = (e: MouseEvent<HTMLDivElement>) => {
        const element = e.target as HTMLDivElement
        const componentProperty =  element.ariaLabel === "Crushers" ? crushers :
        element.ariaLabel === "Screeners" ? screeners :
        element.ariaLabel === "Grinders" ? grinders:
        element.ariaLabel === "Auxilliaries" ? auxilliaries :
        element.ariaLabel === "Concentrators" ? concentrators : []
        setActiveComponent({properties: componentProperty, type: element.ariaLabel || ""})

    }
    const handleObjectRemoval = async (objectId: string, objectName: string, objectType: objectStringType) => {
        const feedback = confirm(`Are you sure you want to delete this object (${objectName})?`)
        if (feedback) {
            const result = await removeObject(objectId, objectType)
            if (result.success) setLoadComponent({status:true, type: mappedObjectType[objectType] as loadComponentType})
            alert(result.message || result.error)
        }
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
            if (loadComponent.type === "") {
                setShapes(await fetchObjects("shapes"))
                setCrushers(await fetchObjects("crushers"))
                setGrinders(await fetchObjects("grinders"))
                setScreeners(await fetchObjects("screeners"))
                setAuxilliaries(await fetchObjects("auxilliary"))
                setConcentrators(await(fetchObjects("concentrators")))
            } else {
                // console.log("load component", loadComponent)
                const result = await fetchObjects(loadComponent.type)
                switch (loadComponent.type) {
                    case "crushers":
                        setCrushers(result)
                        break
                    case "grinders":
                        setGrinders(result)
                        break
                    case "screeners":
                        setScreeners(result)
                        break
                    case "auxilliary":
                        setAuxilliaries(result)
                        break
                    case "concentrators":
                        setConcentrators(result)
                        break
                    default:
                        setShapes(result)

                }
            }
            
        }

        if (loadComponent.status) {
            fetchObj()
            setLoadComponent({status: false, type: ""})
        }

    }, [loadComponent])
  return (
    <>
    <div className="w-[25%] custom-scrollbar bg-white overflow-y-auto pt-6 pl-6 pb-5 pr-4 flex flex-col gap-y-10 border-r border-[#DFE1E6] border-solid">
        <header>
            <Logo logoIcon={logoIcon} isEdited={isEdited}/>
        </header>
        <section>
            <div className="border border-[#DFE1E6] rounded-lg p-2 flex gap-x-3">
                <label htmlFor="search-components" className="flex justify-center items-center">
                    <Image className="cursor-pointer w-3 h-auto" width={14} height={14} src={search} alt="search" quality={100}/>
                </label>
                <input type="text" id="search-components" className="border-0 outline-none text-[#B3B3B3] text-sm" placeholder="Search Components"/>
            </div>
        </section>
        <section className="w-full flex flex-col gap-4">
            <div className="border-b flex flex-col gap-y-5 pb-2">
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-2">
                        <Image width={12} height={12} src={menu} alt="vector" quality={100}/>
                        <h2 className="text-sm font-medium text-text-black">Standard</h2>
                    </div>
                    
                    <Image className="cursor-pointer" width={12} height={12} src={standardOpen?arrowUp:arrowDown} onClick={() => setStandardOpen(!standardOpen)} alt="vector" quality={100}/>
                </div>
                <div className={`flex gap-5 items-center flex-wrap overflow-hidden ${!standardOpen ? "hide-components": ""}`}>
                    {

                        shapes.length > 0 ? shapes.map((shape) => {
                                return <ConvertStringToShape key={shape.id} objectType={"Shape"} objectId={shape.id} objectName={shape.name}/>
                            }): (loadComponent.type === "" && !loadComponent.status) ? <div className="px-4 pb-2 text-sm text-text-gray-3">Shapes haven&apos;t been added yet</div> : <Loader fullScreen={false} offsetHeightClass="h-[20px]" color="black" small={true}/>
                    }
                </div>
            </div>
            <div className="border-b flex flex-col gap-y-5 pb-2">
                
                <div className="flex justify-between items-center">
                    <div className="flex gap-x-2">
                        <Image width={12} height={12} src={menu} alt="vector" quality={100}/>
                        <h2 className="text-sm font-medium text-text-black">Components</h2>
                    </div>
                    
                    <Image className="cursor-pointer" width={12} height={12} src={componentOpen?arrowUp:arrowDown} onClick={() => setComponentOpen(!componentOpen)} alt="vector" quality={100}/>
                </div>
                <div className={`flex gap-x-2 gap-y-4 flex-wrap overflow-hidden ${!componentOpen ? "hide-components": ""}`}>
                    {
                        activeComponent.properties.length ? <section className="flex flex-col gap-y-4 overflow-hidden w-full">
                            <h2 className="font-medium text-text-black text-sm border-b py-2 flex gap-2 items-center mx-2">
                                <span className="cursor-pointer text-text-black" onClick={()=> setActiveComponent({properties: [], type: ""})}>&laquo;</span>

                                {activeComponent.type === "Auxilliaries" ? "Auxilliary Components" : activeComponent.type}</h2>
                            <div className="flex flex-wrap gap-5 overflow-hidden p-2 w-full">
                            {
                                activeComponent.properties.map(component => {
                        
                                    const componentElement = activeComponent.type === "Crushers" ? <ObjectComponentWrapper key={component.id}><Crusher crusher={component} /></ObjectComponentWrapper> : 
                                    activeComponent.type === "Grinders" ? <ObjectComponentWrapper key={component.id}><Grinder grinder={component}/></ObjectComponentWrapper> : 
                                    activeComponent.type === "Screeners" ? <ObjectComponentWrapper key={component.id}><Screener screener={component}/></ObjectComponentWrapper> : 
                                    activeComponent.type === "Auxilliaries" ? <ObjectComponentWrapper key={component.id}><Auxilliary auxilliary={component} /></ObjectComponentWrapper> : 
                                    activeComponent.type === "Concentrators" ? <ObjectComponentWrapper key={component.id}><Concentrator concentrator={component as ConcentratorImageObjectType} /> </ObjectComponentWrapper>: <></>
                                    return componentElement
                                }) 
                            }
                            </div>
                        </section>: components.map(c => {
                            return <div key={c.name} aria-label={c.name} onClick={handleComponentSwitch} className="border border-solid shadow-sm border-[#DFE1E6] p-3 flex flex-col items-center gap-y-4 rounded-lg flex-auto cursor-pointer">
                            <Image width={24} height={24} src={c.image} alt={c.name} quality={100} className="pointer-events-none"/>    
                            <h2 className="text-black-2 text-xs font-md pointer-events-none">{c.name}</h2>
                            </div>
                        })
                    }
                    
                </div>
                
            </div>
            
            <div className="flex flex-col gap-y-5">
                <div className="flex justify-between items-center">
                        <div className="flex gap-x-2">
                            <Image width={12} height={12} src={menu} alt="vector" quality={100}/>
                            <h2 className="text-sm font-medium text-text-black">Personalized Objects</h2>
                        </div>
                        
                        <Image className="cursor-pointer" width={12} height={12} src={customObjectOpen?arrowUp:arrowDown} onClick={() => setCustomObjectOpen(!customObjectOpen)} alt="vector" quality={100}/>
                </div>
                <div className={`flex gap-2 flex-wrap overflow-hidden transition-all ${!customObjectOpen ? "hide-components": ""}`}>
                    <div className="flex flex-wrap gap-4 overflow-hidden p-2">
                        {
                            crushers.length > 0 && crushers.map(crusher=> {
                                if (crusher.creator === user?.id) {
                                    return (<ObjectComponentWrapper key={crusher.id} showTrashIcon={true} handleTrashClick={() => handleObjectRemoval(crusher.id, crusher.name, "Crusher")}>
                                            <Crusher  crusher={crusher} />
                                        </ObjectComponentWrapper>)
                                }
                            })
                        }
                         {
                            grinders.length > 0 && grinders.map(grinder=>{
                                if (grinder.creator === user?.id) {
                                    return (<ObjectComponentWrapper key={grinder.id} showTrashIcon={true} handleTrashClick={() => handleObjectRemoval(grinder.id, grinder.name, "Grinder")}>
                                            <Grinder grinder={grinder}/>
                                        </ObjectComponentWrapper>)
                                }
                            })
                        }
                        {
                            screeners.length > 0 && screeners.map(screener=>{
                                if (screener.creator === user?.id)
                                    return (<ObjectComponentWrapper key={screener.id} showTrashIcon={true} handleTrashClick={() => handleObjectRemoval(screener.id, screener.name, "Screener")}>
                                            <Screener  screener={screener}/>
                                        </ObjectComponentWrapper>)
                            })
                        }
                        {
                            auxilliaries.length > 0 && auxilliaries.map(auxilliary=>{
                                if (auxilliary.creator === user?.id)
                                    return (<ObjectComponentWrapper key={auxilliary.id} showTrashIcon={true} handleTrashClick={() => handleObjectRemoval(auxilliary.id, auxilliary.name, "Auxilliary")}>
                                        <Auxilliary auxilliary={auxilliary}/>
                                    </ObjectComponentWrapper>)
                            })
                        }
                        {
                            concentrators.length > 0 && concentrators.map(concentrator=>{
                                if (concentrator.creator === user?.id)
                                    return (<ObjectComponentWrapper key={concentrator.id} showTrashIcon={true} handleTrashClick={() => handleObjectRemoval(concentrator.id, concentrator.name, "Concentrator")}>      
                                        <Concentrator concentrator={concentrator}/>
                                    </ObjectComponentWrapper>)
                            })
                        }
                    </div>
                </div>
            </div>
            <div className="pt-6">
            
                <Image src={importComponent} width={200} height={118} alt="import" priority quality={100} className="w-full cursor-pointer" draggable={false} onClick={(e)=>setAddCustomComponent(true)}/>
            </div>
        </section>
        {
            addCustomComponent && <CustomComponentForm setAddCustomComponent={setAddCustomComponent} setLoadComponent={setLoadComponent}/>
        }
        
    </div>
    
    </>
  )
}

export default FlowsheetSidebar


const ObjectComponentWrapper = ({children, showTrashIcon = false, handleTrashClick}: {children: React.ReactNode, showTrashIcon?: boolean, handleTrashClick?: () => void}) => {
    return (
        <div className="relative p-3 shadow-sm border border-[#DFE1E6] rounded-lg flex-1 min-w-[120px]">
            {
                showTrashIcon ? <div className="absolute z-10 right-[5%] top-[10%]">
                    <Image src={trash} width={16} height={16} className="cursor-pointer" alt="more" onClick={handleTrashClick}/> 
                </div> : ""
            }
            {children}
        </div>
    )
}
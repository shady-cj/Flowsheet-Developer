"use client"
import {createContext, useState, useRef, Dispatch, SetStateAction, MutableRefObject} from 'react'
import { uploadObject } from '@/lib/actions/projectcanvas'
// import { objectDataType } from '../ProjectLayout/Canvas'

export type lineCordsType = {
  M: [number, number], 
  L: [number, number][]
}
export type objectCoords = {
  startX: number, 
  startY: number, 
  lastX: number, 
  lastY: number,
  lineCoordinates?: lineCordsType
}



/*
Typical objectData sample
{
  [object_id]: {
    oid: [object_id],
    label: string,
    x_coordinate: number(same as lastX from above),
    y_coordinate: number(same as lastY from above),
    scale: number(1.25),
    font_size: 16(px),
    description: string,
    object_info: {
      "object_model_name": Crusher, Grinder, etc...
      "object_id": id
    }

    properties: {
      nextObject: null,
      prevObject: null,
      coordinates: {
        startX: number,
        startY: number,
        lastX: number,
        lastY:number,
        lineCoordinates: 
      },

    }
  }
}

*/


export type objectDataType = {
  [key: string]: {
    id?: number,
    oid: string,
    label: string,
    x_coordinate: number,
    y_coordinate: number,
    scale: number,
    font_size: number,
    description: string,
    object?: {},
    object_info: {
      object_model_name: string,
      object_id: string
    },
  
    properties: {
      nextObject: string[],
      prevObject: string[],
      gape?: string,
      set?: string,
      aperture?: string,
      coordinates: objectCoords
    }
  }
}





type contextType = {
  canvasLoading: boolean,
  objectData: MutableRefObject<objectDataType>,
  hasInstance: MutableRefObject<boolean>,
  setCanvasLoading: Dispatch<SetStateAction<boolean>>,
  saveObjectData: (paramsId: string)=>void
}

export const ProjectContext = createContext<contextType>(null!)


const ProjectProvider = ({children}: {children: React.ReactNode}) => {
  const objectData = useRef<objectDataType>({})
  const [canvasLoading, setCanvasLoading] = useState(true)
  const hasInstance = useRef(false) // To check if the objectData has initially been created so it'll be updated instead of be recreated

  const saveObjectData = async (paramsId: string) => {
    const objects = await uploadObject(objectData.current, paramsId, hasInstance.current)
    if (Object.keys(objects).length > 0) {
      objectData.current = objects
      hasInstance.current = true
    }
  }
  

  return (
    <ProjectContext.Provider value={{canvasLoading, setCanvasLoading, saveObjectData, objectData, hasInstance}}>
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectProvider

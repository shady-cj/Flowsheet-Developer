"use client"
import {createContext, useState, useRef, Dispatch, SetStateAction, MutableRefObject, useCallback} from 'react'
import { uploadObject } from '@/lib/actions/projectcanvas'
import { fetchUser } from '@/lib/actions/auth';
import { fetchProject } from '@/lib/actions/project';
// import { objectDataType } from '../ProjectLayout/Canvas'
import { toPng } from 'html-to-image';






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
    textActive?: boolean, // for text elements
    object?: {
      id: string,
      name: string,
      model_name: string,
      image_url?: string,
      description?: string,
      type?: string
    },
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
      maxOreSize?: string,
      oreQuantity?: string,
      oreGrade?: string,
      crusherType?: "primary" | "secondary" | "tertiary",
      coordinates: objectCoords
    }
  }
}


export type userType = {
  id: string, 
  email: string,
  projects: {id: string, name: string, description: string, creator: string}[]
} | null

export type projectType = {id: string, name: string, description: string, creator: string} | null

type contextType = {
  canvasLoading: boolean,
  objectData: MutableRefObject<objectDataType>,
  hasInstance: MutableRefObject<boolean>,
  canvasRef: MutableRefObject<HTMLDivElement>,
  userObject: userType,
  projectObject: projectType,
  setCanvasLoading: Dispatch<SetStateAction<boolean>>,
  saveObjectData: (paramsId: string)=>void,
  htmlToImageConvert: () =>void,
  getUser: () => void,
  getProject: (projectID: string) => void
}



export const ProjectContext = createContext<contextType>(null!)


const ProjectProvider = ({children}: {children: React.ReactNode}) => {
  const canvasRef = useRef<HTMLDivElement>(null!)
  const objectData = useRef<objectDataType>({})
  const [canvasLoading, setCanvasLoading] = useState(true)
  const hasInstance = useRef(false) // To check if the objectData has initially been created so it'll be updated instead of be recreated
  const [userObject, setUserObject] = useState<userType>(null)
  const [projectObject, setProjectObject] = useState<projectType>(null)

  const saveObjectData = async (paramsId: string) => {
    const objects = await uploadObject(objectData.current, paramsId, hasInstance.current)
    if (Object.keys(objects).length > 0) {
      objectData.current = objects
      hasInstance.current = true
    }
  }

  /**
 * 
 * Test feature on saving html to image
 */
  const htmlToImageConvert = () => {
  
    toPng(canvasRef.current, { cacheBust: false, width: 700, height: 650, style: {background: "transparent"}})
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const getUser = useCallback(async () => {
    setUserObject(await fetchUser())
  }, [])
  const getProject = useCallback(async (projectID: string) => {
    setProjectObject(await fetchProject(projectID))
  }, [])
  return (
    <ProjectContext.Provider value={{canvasRef, canvasLoading, setCanvasLoading, saveObjectData, objectData, hasInstance, htmlToImageConvert, userObject, getUser, projectObject, getProject}}>
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectProvider

"use client"
import {createContext, useState, useRef, Dispatch, SetStateAction, MutableRefObject, useCallback, RefObject} from 'react'
import { validateCommunitionPaths } from '@/lib/utils/bondsEnergyUtiltyFunctions';
import { uploadObject } from '@/lib/actions/projectcanvas'
import { fetchUser } from '@/lib/actions/auth';
import { fetchProject } from '@/lib/actions/project';
// import { objectDataType } from '../ProjectLayout/Canvas'
import Report, { createReport } from '@/lib/utils/report';
import { toPng } from 'html-to-image';
import generatePDF from 'react-to-pdf';






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
export type singleObjectDataType = {
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

export type objectDataType = {
  [key: string]: singleObjectDataType
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
  calculateBondsEnergy: MutableRefObject<Boolean>,
  userObject: userType,
  projectObject: projectType,
  Wvalue: string | null,
  communitionListForBondsEnergy: MutableRefObject<singleObjectDataType[]>,
  workIndex: RefObject<HTMLInputElement>,
  setCanvasLoading: Dispatch<SetStateAction<boolean>>,
  setWvalue: Dispatch<SetStateAction<string | null>>,
  saveObjectData: (paramsId: string)=>void,
  htmlToImageConvert: () =>void,
  getUser: () => void,
  getProject: (projectID: string) => void
  calculateEnergyUsed: () => void
}



export const ProjectContext = createContext<contextType>(null!)


const ProjectProvider = ({children}: {children: React.ReactNode}) => {
  const canvasRef = useRef<HTMLDivElement>(null!)
  const objectData = useRef<objectDataType>({})
  const [canvasLoading, setCanvasLoading] = useState(true)
  const hasInstance = useRef(false) // To check if the objectData has initially been created so it'll be updated instead of being recreated
  const [userObject, setUserObject] = useState<userType>(null)
  const [projectObject, setProjectObject] = useState<projectType>(null)
  const calculateBondsEnergy = useRef<Boolean>(false)
  const communitionListForBondsEnergy = useRef<singleObjectDataType[]>([])
  const workIndex = useRef<HTMLInputElement>(null)
  const [Wvalue, setWvalue] = useState<string | null>(null)

  const reportRef = useRef<HTMLDivElement>(null)

  const saveObjectData = async (paramsId: string) => {
    const objects = await uploadObject(objectData.current, paramsId, hasInstance.current)
    if (Object.keys(objects).length > 0) {
      objectData.current = objects
      hasInstance.current = true
    }
  }




  const calculateEnergyUsed = () => {
    // Dp = diameter in microns for product passes (80%)
    // Df = diameter in microns for which 80% of feed passes
    // W = work input in KW h/short ton
    // Wi = Work index
    
    if (!workIndex.current!.value || isNaN(Number(workIndex.current!.value))) {
      communitionListForBondsEnergy.current = []
      alert("Work Index Value must be a number")
      return
    }
    const Wi = parseFloat(workIndex.current!.value)
    const isValidPath = validateCommunitionPaths(communitionListForBondsEnergy.current, objectData.current)
    if (!isValidPath) {
      communitionListForBondsEnergy.current = []
      alert("Invalid connection between two points")
      return
    }
    const Dp = parseFloat(communitionListForBondsEnergy.current[1].properties.set!) * 0.8
    const Df = parseFloat(communitionListForBondsEnergy.current[0].properties.gape!) * 0.8
    const W = 10 * Wi * ((1/Math.sqrt(Dp)) - (1/Math.sqrt(Df)))
    // communitionListForBondsEnergy.current = []
    setWvalue(W.toFixed(3))
  }

  /**
 * 
 * Test feature on saving html to image
 */
  const htmlToImageConvert = () => {

    // console.log(reportRef.current)
    // generatePDF(reportRef, {filename: 'page.pdf'})
    return 
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
    <ProjectContext.Provider value={{canvasRef, canvasLoading, setCanvasLoading, saveObjectData, objectData, hasInstance, htmlToImageConvert, userObject, getUser, projectObject, getProject, calculateBondsEnergy, communitionListForBondsEnergy, workIndex, calculateEnergyUsed, Wvalue, setWvalue}}>
      {children}
      {/* {
          <Report objectData={objectData.current} ref={reportRef}/>
      } */}

    </ProjectContext.Provider>
  )
}

export default ProjectProvider

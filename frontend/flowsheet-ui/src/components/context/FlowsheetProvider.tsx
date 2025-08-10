"use client"
import {createContext, useState, useRef, Dispatch, SetStateAction, MutableRefObject, useCallback, RefObject} from 'react'
import { validateCommunitionPaths } from '@/lib/utils/bondsEnergyUtiltyFunctions';
import { uploadObject } from '@/lib/actions/flowsheetcanvas'
import { fetchUser } from '@/lib/actions/auth';
import { fetchFlowsheet } from '@/lib/actions/flowsheet';
// import { objectDataType } from '../ProjectLayout/Canvas'

// import Report, { createReport } from '@/lib/utils/report';

import generatePDF from 'react-to-pdf';
import { renderToStaticMarkup } from 'react-dom/server';
import { previewImageGenerator } from '@/lib/utils/htmlConvertToImage';
import { fetchedFlowsheetsType } from '../DashboardLayout/DashboardPageRenderer';






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
    image_height?: number,
    image_width?: number,
    description?: string,
    type?: string
    valuable_recoverable?: number,
    gangue_recoverable?: number,
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
    defaultMaxOreSize?: string, //fallback value
    oreQuantity?: string,
    defaultOreQuantity?: string,
    oreGrade?: string,
    defaultOreGrade?: string, 
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

// export type flowsheetType = {id: string, name: string, description: string, get_mins_ago: string, project: string} | null

type contextType = {
  canvasLoading: boolean,
  objectData: MutableRefObject<objectDataType>,
  hasInstance: MutableRefObject<boolean>,
  isEdited: boolean,
  isSaving: boolean,
  canvasRef: MutableRefObject<HTMLDivElement>,
  calculateBondsEnergy: MutableRefObject<Boolean>,
  userObject: userType,
  flowsheetObject: fetchedFlowsheetsType | null,
  Wvalue: string | null,
  communitionListForBondsEnergy: MutableRefObject<singleObjectDataType[]>,
  workIndex: RefObject<HTMLInputElement>,
  pageNotFound: boolean,
  setIsEdited: Dispatch<SetStateAction<boolean>>,
  setIsSaving: Dispatch<SetStateAction<boolean>>,
  setPageNotFound: Dispatch<SetStateAction<boolean>>,
  setCanvasLoading: Dispatch<SetStateAction<boolean>>,
  setWvalue: Dispatch<SetStateAction<string | null>>,
  setFlowsheetObject: Dispatch<SetStateAction<fetchedFlowsheetsType | null>>,
  saveObjectData: (paramsId: string)=>void,
  getUser: () => void,
  getFlowsheet: (projectID: string, flowsheetID: string) => void
  calculateEnergyUsed: () => void
}



export const FlowsheetContext = createContext<contextType>(null!)


const FlowsheetProvider = ({children}: {children: React.ReactNode}) => {
  const canvasRef = useRef<HTMLDivElement>(null!)
  const objectData = useRef<objectDataType>({})
  const [pageNotFound, setPageNotFound] = useState(false)
  const [canvasLoading, setCanvasLoading] = useState(true)
  const hasInstance = useRef(false) // To check if the objectData has initially been created so it'll be updated instead of being recreated
  const [isEdited, setIsEdited] = useState(false) // To keep track of whether the canvas has been edited or not, if edited means it needs to be saved
  const [isSaving, setIsSaving] = useState(false) // To keep track of whether the canvas is being saved or not
  const [userObject, setUserObject] = useState<userType>(null)
  const [flowsheetObject, setFlowsheetObject] = useState<fetchedFlowsheetsType | null>(null)
  const calculateBondsEnergy = useRef<Boolean>(false)
  const communitionListForBondsEnergy = useRef<singleObjectDataType[]>([])
  const workIndex = useRef<HTMLInputElement>(null)
  const [Wvalue, setWvalue] = useState<string | null>(null)

  // const reportRef = useRef<HTMLDivElement>(null)


  const saveObjectData = useCallback(async (paramsId: string) => {
    if (!isEdited) return
    setIsSaving(true)
    const objects = await uploadObject(objectData.current, paramsId, hasInstance.current)
    if (Object.keys(objects).length > 0) {
      objectData.current = objects
      hasInstance.current = true
    }
    await previewImageGenerator(canvasRef.current, objectData.current, paramsId)
    setIsSaving(false)
    setIsEdited(false)
  }, [canvasRef, objectData, isEdited])




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
    console.log("is valid path", isValidPath)
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
 


  const getUser = useCallback(async () => {
    setUserObject(await fetchUser())
  }, [])


  const getFlowsheet = useCallback(async (projectID: string, flowsheetID: string) => {
    const flowsheetData = await fetchFlowsheet(projectID, flowsheetID)
    console.log("flowsheetData", flowsheetData)
    setFlowsheetObject(flowsheetData)
  }, [])



  return (
    <FlowsheetContext.Provider value={{
      canvasRef, canvasLoading, 
      setCanvasLoading, saveObjectData, 
      objectData, hasInstance, userObject, 
      getUser, flowsheetObject, setFlowsheetObject,
      getFlowsheet, calculateBondsEnergy, 
    communitionListForBondsEnergy, workIndex, 
    calculateEnergyUsed, Wvalue, setWvalue,
    pageNotFound, setPageNotFound, isEdited, setIsEdited, isSaving, setIsSaving,
    }}>
      {children}
      {/* {
          <Report objectData={objectData.current} ref={reportRef}/>
      } */}

    </FlowsheetContext.Provider>
  )
}

export default FlowsheetProvider

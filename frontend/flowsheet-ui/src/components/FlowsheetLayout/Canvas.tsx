"use client";
import { useEffect, useState, useRef, useCallback, DragEvent, ChangeEvent, FormEvent, useContext } from "react";
import { useRouter } from "next/navigation";
import { loadObjects } from "@/lib/actions/flowsheetcanvas";
import ObjectForm from "./ObjectForm";
import { FlowsheetContext, singleObjectDataType } from "../context/FlowsheetProvider";
import { UserContext } from "../context/UserProvider";
import { objectDataType, lineCordsType,  objectCoords} from "../context/FlowsheetProvider";
import { ObjectCreator } from "../Objects/ObjectCreator";
import { renderToStaticMarkup } from "react-dom/server"
import arrowDown from "@/assets/arrow-down.svg"
import arrowUp from "@/assets/arrow-up.svg"
import Loader from "../utils/loader";
import { concentratorAnalysis } from "@/lib/utils/concentrator-analysis";
import { v4 as uuidv4 } from 'uuid';


export type objectType = "Shape" | "Grinder" | "Crusher" | "Screener" | "Concentrator" | "Auxilliary";

type pointStoreType = {
  [key: string]: [
    {
      prev: string | null, 
      next: string | null
    }, 
    ["M"] | ["L", number, number?]
  ]
}
// export type formStateObjectType = {
//   label: string
//   description: string
//   gape?: number
//   set?: number
//   apertureSize?: number
export type formFieldsType = {type:string, name: string, verboseName: string, htmlType: string, placeholder?: string, options?: {name: string, value:string}[]}[]




const defaultFormField: formFieldsType = [
  {
    type: "text",
    name: "label",
    verboseName: "Label", 
    htmlType: "input"
  },
  {
    type: "text",
    name: "description",
    verboseName: "Description",
    htmlType: "textarea"
  }
]


export const canvasContainerContentWidth = 10000
export const canvasContainerContentHeight = 10000

// }
export type formStateObjectType = {[index: string]: string}


const Canvas = ({params}: {params: {project_id: string, flowsheet_id: string}}) => {
    // console.log('params', params, params.project_id, params.flowsheet_id)
    const {
        setCanvasLoading, saveObjectData, 
        setIsEdited,calculateEnergyUsed, setPageNotFound,
        flowsheetObject, objectData, hasInstance, 
        canvasRef, calculateBondsEnergy, communitionListForBondsEnergy, 
        pageNotFound, canvasLoading, isEdited
      } = useContext(FlowsheetContext)
    const {user, loadingUser} = useContext(UserContext)
    const CanvasParentContainer = useRef<HTMLElement>(null!)
    const [isOpened, setIsOpened] = useState<boolean>(false)
    const onPanelResize = useRef(false)
    const panelMouseStart = useRef<{x: number, y: number}>({x: 0, y: 0})
    const panelObjectOffsetStart = useRef<{x: number, y: number}>({x: 0, y: 0})
    const mouseMoved = useRef(false)
    // const panelCoordinateXMarker = useRef<number | null>(null)
    // const panelCoordinateYMarker = useRef<number | null>(null)
    const panelResizeScaleMarker = useRef<{x: number, y: number}>({x: 0, y: 0}) 
    const currentPanel = useRef<HTMLSpanElement>(null!)
    const currentObject = useRef<HTMLElement>(null!)
    const prevActiveObject = useRef<HTMLElement | null>(null)
    const pointStore = useRef<pointStoreType>({}) // Point store format [pointId it connects from, [L or M coordinates, index in the lineCoordinate array, index of the next point]]
    const currentActivePoint = useRef<HTMLSpanElement | null>(null)
    const onMouseDown = useRef(false)
    const [objectFormPosition, setObjectFormPosition] = useState<{x: number, y: number}>({x: 20, y: 20})
    const objectLabels = useRef(new Set<string>())
    const [formFields, setFormFields] = useState<formFieldsType>(defaultFormField)
    const objectFormType = useRef<objectType>("Shape")
    const [formState, setFormState] = useState<formStateObjectType | null>(null)
    const primaryCrusherInUse = useRef(false)
    const lineCapCoordinate = "10,22 18,5 10,9 2,5"
    const animationFrameRef = useRef<number | null>(null)

    // keeping track of various handlers and the elements for event listeners clean up to prevent memory leak
    const eventElementSet = useRef(new Set<Element | HTMLElement |  SVGPathElement>())

    const elementEventHandlers = useRef(new WeakMap<Element | HTMLElement |  SVGPathElement, Map<keyof DocumentEventMap, ((ev: MouseEvent) => void) | ((ev: FocusEvent) => void) | ((ev: KeyboardEvent) => void) >>()) // key is dom element value is a map of event to function.
    const areListenersAttached = useRef(false)


    const eventTracker = useRef<{
      mouseDownEventInvoked: {status: boolean, event: MouseEvent | null, element: HTMLElement | null, point?: HTMLSpanElement},
      panelMouseDownEventInvoked: {status: boolean, event: MouseEvent | null, element: HTMLSpanElement | null},
      mouseUpEventInvoked: {status: boolean, event: MouseEvent | null, element?: HTMLElement, point?: HTMLSpanElement},
      createMultiplePointEventInvoked: {status: boolean, event: MouseEvent | null, element: HTMLSpanElement | null},
      mouseMoveEventInvoked: {status: boolean, event: MouseEvent | null, element: HTMLElement | null},
      generalMouseUpEventInvoked: {status: boolean, event: MouseEvent | null}
    }>({
      mouseDownEventInvoked: {status: false, event: null, element: null}, 
      panelMouseDownEventInvoked: {status: false, event: null, element: null}, 
      mouseUpEventInvoked: {status: false, event: null, element: undefined}, 
      createMultiplePointEventInvoked: {status: false, event: null, element: null},
      mouseMoveEventInvoked: {status: false, event: null, element: null},
      generalMouseUpEventInvoked: {status: false, event: null}
    })

    // const router = useRouter()


    const validatePositiveInteger = (attribute: keyof formStateObjectType, title: string) => {
      if (isNaN(Number(formState![attribute]))) {
        alert(`${title} value must be a number (mm)`)
        return false
      }
      if (Number(formState![attribute]) < 0) {
        alert(`${title} value must be a positive number (mm)`)
        return false
      }
      return true
    }

    const updateObjectData = () => {
      const object = currentObject.current
      objectData.current[object.id].label = formState!.label.trim().toLowerCase()
      objectLabels.current.add(formState!.label.trim().toLowerCase())
      objectData.current[object.id].description = formState!.description
      if (formState!.gape)
        objectData.current[object.id].properties.gape = formState!.gape
      if (formState!.set)
        objectData.current[object.id].properties.set = formState!.set
      if (formState!.aperture)
        objectData.current[object.id].properties.aperture = formState!.aperture
      if (formState!.crusherType){
        if (formState!.crusherType === "primary") primaryCrusherInUse.current = true
        objectData.current[object.id].properties.crusherType = formState!.crusherType as "primary" | "secondary" | "tertiary"
      }
      if (formState!.maxOreSize) {
        objectData.current[object.id].properties.maxOreSize = formState!.maxOreSize
        objectData.current[object.id].properties.defaultMaxOreSize = formState!.maxOreSize
      }
      if (formState!.oreQuantity) {
        objectData.current[object.id].properties.oreQuantity = formState!.oreQuantity
        objectData.current[object.id].properties.defaultOreQuantity = formState!.oreQuantity // fall back
      }
      if (formState!.oreGrade) {
        objectData.current[object.id].properties.oreGrade = formState!.oreGrade
        objectData.current[object.id].properties.defaultOreGrade = formState!.oreGrade

      }
    }


    const handleFormState = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (formState !== null)
        setFormState((prevState) => {
          return {...prevState, [e.target.name]: e.target.value}
        })
    }



    const handleFormSave = (e: FormEvent) => {
      e.preventDefault()
      if (formState!.label.trim().length === 0)
      {
        alert("Label can't be empty")
        return;
      }
      if (formState!.description.length === 0) {
        alert("Please give a description as this information would be used to generate a report on your flowsheet")
        return;
      }
      if (objectLabels.current.has(formState!.label.trim().toLowerCase())) {
        alert(`Label "${formState!.label.trim()}" already exists, labels must be unique to the project`)
        return;
      }
      if (formState!.gape?.length === 0) {
        alert("Please provide the gape value of the Crusher/Grinder")
        return;
      }
      if (formState!.set?.length === 0) {
        alert("Please provide the set value of the Crusher/Grinder")
        return;
      }
      if (formState!.aperture?.length === 0) {
        alert("Please provide the aperture size of the screener to be used")
        return;
      }
      if (formState!.crusherType?.length === 0) {
        alert("Please identify what you want to use this crusher as")
        return;
      }
      if (formState!.maxOreSize?.length === 0) {
        alert("The maximum size of the ore is required")
        return;
      }
      
      if (formState!.oreGrade?.length === 0) {
        alert("The grade of the ore is required")
        return;
      }
      
      if (formState!.oreQuantity?.length === 0) {
        alert("The quantity of the ore is required")
        return;
      }

      if (formState!.gape) {
        if (!validatePositiveInteger("gape", "Gape"))
          return
      }

      if (formState!.set) {
        if (!validatePositiveInteger("set", "Set"))
          return
      }

      if (formState!.aperture) {
       if (!validatePositiveInteger("aperture", "Aperture"))
          return
      }

      if (formState!.maxOreSize) {
        if (!validatePositiveInteger("maxOreSize", "Maximum Ore Size"))
          return
      }

      if (formState!.oreGrade) {
        if (!validatePositiveInteger("oreGrade", "Ore Grade"))
          return
        if (Number(formState!.oreGrade) > 1) {
          alert("Ore grade can't be greater than 1")
          return;
        }
      }
      if (formState!.oreQuantity) {
        if (!validatePositiveInteger("oreQuantity", "Ore Quantity"))
          return
      }


      if (formState!.crusherType === "primary" && primaryCrusherInUse.current){
        alert("You can't have multiple primary crushing operation")
        return;
      }
     

      setIsEdited(true)
      updateObjectData()
      setFormState(null)
      setFormFields(defaultFormField)
      setIsOpened(false)
    }

    const closeFormUnsaved = () => {

      const element = currentObject.current
      if (element) {
        // remove event listeners
        if (eventElementSet.current.has(element)) {
          const elRemove = elementEventHandlers.current.get(element)
          elRemove?.forEach((handlerFn, event) => {
            element.removeEventListener(event, handlerFn as EventListenerOrEventListenerObject)
          })
          eventElementSet.current.delete(element)
          elementEventHandlers.current.delete(element)
        }

        delete objectData.current[element.id]
        currentObject.current = prevActiveObject.current!
        element.remove()
      }
      
      setFormState(null)
      setFormFields(defaultFormField)
      setIsOpened(false)
      setObjectFormPosition({x: 20, y: 20})
    }


    const showObjectForm = (x: number, y: number, type: objectType, auxilliaryType: string | null) => {
     
     
      let formStateObject: formStateObjectType = {
        label: "",
        description: ""
      }
      objectFormType.current = type

      switch (type) {
        case "Crusher":
        case "Grinder":
          formStateObject["gape"] = ""
          formStateObject["set"] = ""
          
          setFormFields((prevFormField) => {
            return [...prevFormField, {
              type: "number",
              name: "gape",
              placeholder: "Gape in mm",
              verboseName: "Gape", 
              htmlType: "input"
            }, {
              type: "number",
              name: "set",
              placeholder: "Set in mm",
              verboseName: "Set", 
              htmlType: "input"
            }]
          })
        case "Crusher":
          if (type === "Grinder") break
          formStateObject["crusherType"] = ""
          setFormFields((prevFormField) => {
            return [...prevFormField, {
              type: "text",
              name: "crusherType",
              verboseName: "Crusher Type", 
              htmlType: "select",
              options: [{name: "Primary", value: "primary"}, {name: "Secondary", value: "secondary"}, {name:"Tertiary", value: "tertiary"}]
            }]
          })
          break
        case "Screener":
          formStateObject["aperture"] = ""
          setFormFields((prevFormField) => {
            return [...prevFormField, {
              type: "number",
              name: "aperture",
              verboseName: "Aperture Size", 
              htmlType: "input",
              placeholder: "Size in mm"
            }]
          })
          break
        case "Concentrator":
          formStateObject["oreQuantity"] = ""
          formStateObject["oreGrade"] = ""
          setFormFields((prevFormField) => {
            return [...prevFormField, {
              type: "number",
              name: "oreQuantity",
              verboseName: "Quantity of Ore", 
              htmlType: "input",
              placeholder: "Quantity in metric tons"
            },{
                type: "number",
                name: "oreGrade", 
                verboseName: "Ore Grade",
                placeholder: "Grade e.g 0.45",
                htmlType: "input"
              }]
          })
          break;

        case "Auxilliary":
          if (auxilliaryType === "ORE") {
            formStateObject["maxOreSize"] = ""
            formStateObject["oreGrade"] = ""
            formStateObject["oreQuantity"] = ""
            setFormFields((prevFormField) => {
              return [...prevFormField, {
                type: "number",
                name: "maxOreSize", 
                verboseName: "Maximum Size of Ore",
                placeholder: "Max. Size in mm",
                htmlType: "input"
              }, {
                type: "number",
                name: "oreGrade", 
                verboseName: "Ore Grade",
                placeholder: "Grade e.g 0.45",
                htmlType: "input"
              }, {
                type: "number",
                name: "oreQuantity", 
                verboseName: "Ore Quantity",
                placeholder: "Quantity in metric tons",
                htmlType: "input"
              }]
            })
          }
          break
      }

      setFormState(formStateObject)
      setIsOpened(true)
      setObjectFormPosition({x, y})
    }

      const setPrevAndNextObjectConnections = useCallback((prevObject: singleObjectDataType, nextObject: singleObjectDataType)=> {
      

        
        if (nextObject?.properties.gape || nextObject?.properties.aperture) {

          if (!prevObject.properties.gape && !prevObject.properties.aperture && !prevObject.properties.maxOreSize) return true // skip (no need for validating connection)
          if (prevObject.properties.aperture && (!prevObject.properties.maxOreSize || parseFloat(prevObject.properties.maxOreSize) >= parseFloat(prevObject.properties.aperture)))
            prevObject.properties.maxOreSize = prevObject.properties.aperture
          else if (prevObject.properties.gape && (!prevObject.properties.maxOreSize || parseFloat(prevObject.properties.maxOreSize) >= parseFloat(prevObject.properties.gape)))
            prevObject.properties.maxOreSize = prevObject.properties.gape
 

          let feedSize = null
          if (prevObject.properties.set) {
              // using 1.25 because theoretically 1.2 - 1.5 x set would usually be the maximum ore size in the product
            if (parseFloat(prevObject.properties.set) * 1.25 > parseFloat(prevObject.properties.maxOreSize!)) feedSize = parseFloat(prevObject.properties.maxOreSize!)
            else feedSize = parseFloat(prevObject.properties.set) * 1.25
          } else if (prevObject.properties.aperture) {
            if (parseFloat(prevObject.properties.aperture) > parseFloat(prevObject.properties.maxOreSize!)) feedSize = parseFloat(prevObject.properties.maxOreSize!)
            else feedSize = parseFloat(prevObject.properties.aperture)
          } else {
            feedSize = parseFloat(prevObject.properties.maxOreSize!)
          }
          if (nextObject.properties.gape) {
            const gape = parseFloat(nextObject.properties.gape)
            if ((0.8 * gape) >= feedSize) {
              // largest feed size must be less than or equal to 0.8 x gape size
              nextObject.properties.maxOreSize = feedSize.toString()
              return true
            }
            return false
          } else if (nextObject.properties.aperture) {
            const apertureSize = parseFloat(nextObject.properties.aperture)
            if (feedSize <= apertureSize) {
              nextObject.properties.maxOreSize = feedSize.toString()
              return true
            }
            return false
          }
        }
        if (nextObject.object?.model_name === "Concentrator") {
          if (prevObject.properties.oreQuantity) nextObject.properties.oreQuantity = prevObject.properties.oreQuantity
          else nextObject.properties.oreQuantity = nextObject.properties.defaultOreQuantity
          if (prevObject.properties.oreGrade) nextObject.properties.oreGrade = prevObject.properties.oreGrade
          else nextObject.properties.oreGrade = nextObject.properties.defaultOreGrade
        }
        if (nextObject.object?.model_name === "Auxilliary" && nextObject.object?.type?.toLowerCase() === "ore") {
          if (prevObject.properties.maxOreSize) nextObject.properties.maxOreSize = prevObject.properties.maxOreSize
          else nextObject.properties.maxOreSize = nextObject.properties.defaultMaxOreSize

          if (prevObject.properties.oreQuantity) nextObject.properties.oreQuantity = prevObject.properties.oreQuantity
          else nextObject.properties.oreQuantity = nextObject.properties.defaultOreQuantity
        }
        return true
    }, [])



    const checkAndSetConnection = useCallback((type: "from" | "to", lineId: string, shapeId: string) => {
      // Check and validate connection (ore size, aperture size, gape, set)
      // Update the ore quantity.

      // from: if an object is connected to the M coordinates of a line, the 
      // lineId - id of the line
      // shapeId - shape or object that's being linked at the M coordinate
      
      // to: if an object is connected to the L coordinates of a line, the
      // lineId - remains the id of the line as mentioned earlier
      // shapeId - shape or object that's being connected to at the L coordinate.


      const line = objectData.current[lineId]
      const activeObject = objectData.current[shapeId]


      if (type === "from") {
        const nextObjectId = line.properties.nextObject[0]
        if (!nextObjectId) return true
        const nextObject = objectData.current[nextObjectId]
        if (!nextObject) return true
        return setPrevAndNextObjectConnections(activeObject, nextObject)
      }
      if (type === "to") {
        const prevObjectId = line.properties.prevObject[0]
        if (!prevObjectId) return true
        const prevObject = objectData.current[prevObjectId]
        if (!prevObject) return true
        return setPrevAndNextObjectConnections(prevObject, activeObject)
      }

    }, [objectData, setPrevAndNextObjectConnections])


    const MCoordinateConnection = useCallback((obj: Element, line: Element) => {

      objectData.current[line.id].properties.prevObject[0] = obj.id
      const nextObjectId = objectData.current[line.id].properties.nextObject[0]
      
      if (nextObjectId && objectData.current[nextObjectId]) {
        // Adding line's next object attribute to the current object nextObject attribute
        if (!objectData.current[obj.id].properties.nextObject.includes(nextObjectId))
          objectData.current[obj.id].properties.nextObject.push(nextObjectId)

        // Adding the line's current object to the nextObject's prevObject attribute 
        if (!objectData.current[nextObjectId].properties.prevObject.includes(obj.id))
          objectData.current[nextObjectId].properties.prevObject.push(obj.id)
      } else if (nextObjectId && !objectData.current[nextObjectId]) {
        // if the nextObjectId doesn't exist anymore... clean it up
        if (objectData.current[obj.id].properties.nextObject.includes(nextObjectId)){
          const indexOfNextObjectId = objectData.current[obj.id].properties.nextObject.indexOf(nextObjectId)
          objectData.current[obj.id].properties.nextObject.splice(indexOfNextObjectId, 1)  
        }
        objectData.current[line.id].properties.nextObject = []
      }

    }, [objectData])

    const LCoordinateConnection = useCallback((obj: Element, line: Element) => {
      // setting the line next object attribute
      objectData.current[line.id].properties.nextObject[0] = obj.id
      
      const prevObjectId = objectData.current[line.id].properties.prevObject[0]
      
  
      if (prevObjectId && objectData.current[prevObjectId]) {
        // Adding line's prev object attribute to the current object prevObject attribute
        if (!objectData.current[obj.id].properties.prevObject.includes(prevObjectId))
          objectData.current[obj.id].properties.prevObject.push(prevObjectId)

          // Adding the line's current object to the prevObject's nextObject attribute 
        if (!objectData.current[prevObjectId].properties.nextObject.includes(obj.id))
          objectData.current[prevObjectId].properties.nextObject.push(obj.id)
      } else if (prevObjectId && !objectData.current[prevObjectId]) {
          // removing the prev object from the current object  previous object attribute in case there's a prevObjectId
        if (objectData.current[obj.id].properties.prevObject.includes(prevObjectId)) {
          
          const getPrevObjectIndex = objectData.current[obj.id].properties.prevObject.indexOf(prevObjectId)
          objectData.current[obj.id].properties.prevObject.splice(getPrevObjectIndex, 1)
        }
        objectData.current[line.id].properties.prevObject = []
      }
    }, [objectData])


    const cleanUpInvalidConnections = useCallback((line: HTMLElement, obj: HTMLElement, coordinateCheck?: string) => {
       // Note: 
          /**
           * 
           * STEPS TO CAREFULLY DISCONNECTING THE LINES
               * 1. check the current line previous and next object to remove it
               * 2. if it's the line's previous object that is equivalent to the current object id (M coordinates)
               *     - remove the current object id from the previous object id arrays of the line
               *     - get the line's nextObject id
               *     - remove the line's nextObject id from the current object's nextObject id arrays
               *     - remove the object id from nextObject's previous id arrays
               * 3. if it's the line's next object id that is equivalent to the current object id (L coordinates)
               *     - remove the current object id from the next object id arrays of the line
               *     - get the line's previous object id
               *     - remove the line's previous object id from the current object's prevObject id arrays
               *     - remove the current object id from the previous object's nextObject id arrays
               *    
               *      
               */
          // There is a disconnection or there was never a connection
          // Scenarios: 
          // 1. disconnection from the lines M coordinates
          // 2. disconnection from the lines L coordinates
          // 3. no connection existed in the first place

          let getCurrentLinePrevObjectId: string | null = objectData.current[line.id].properties.prevObject[0]
          let getCurrentLineNextObjectId: string | null = objectData.current[line.id].properties.nextObject[0]

          const tempCurrentLinePrevObjectId = getCurrentLinePrevObjectId
          const tempCurrentLineNextObjectId = getCurrentLineNextObjectId

          // Check if the id still exists.
          if (getCurrentLineNextObjectId && !objectData.current[getCurrentLineNextObjectId])  {
              objectData.current[line.id].properties.nextObject = []
              getCurrentLineNextObjectId = null

              if (tempCurrentLinePrevObjectId && objectData.current[tempCurrentLinePrevObjectId]?.properties.nextObject.includes(tempCurrentLineNextObjectId))  {
                  const getIndex = objectData.current[tempCurrentLinePrevObjectId].properties.nextObject.indexOf(tempCurrentLineNextObjectId)
                  objectData.current[tempCurrentLinePrevObjectId].properties.nextObject.splice(getIndex, 1)
              }


          }
          if (getCurrentLinePrevObjectId && !objectData.current[getCurrentLinePrevObjectId]) {
              objectData.current[line.id].properties.prevObject = []
              getCurrentLinePrevObjectId = null

              if (tempCurrentLineNextObjectId && objectData.current[tempCurrentLineNextObjectId]?.properties.prevObject.includes(tempCurrentLinePrevObjectId))  {
                  const getIndex = objectData.current[tempCurrentLineNextObjectId].properties.prevObject.indexOf(tempCurrentLinePrevObjectId)
                  objectData.current[tempCurrentLineNextObjectId].properties.prevObject.splice(getIndex, 1)
              }

          }


          // 1. disconnection from the lines M coordinates         
          
          if ((!coordinateCheck || coordinateCheck === "M") && getCurrentLinePrevObjectId === obj.id) {
              // remove current obj id as the line's prevObject 
              objectData.current[line.id].properties.prevObject = []

              // getting the line's nextObject id
              const nextObjectId = objectData.current[line.id].properties.nextObject[0]

              // removing the current object from the line next object attribute in case there's a nextObjectId
              
              if (nextObjectId && objectData.current[obj.id]?.properties.nextObject.includes(nextObjectId)){
                  const indexOfNextObjectId = objectData.current[obj.id].properties.nextObject.indexOf(nextObjectId)
                  objectData.current[obj.id].properties.nextObject.splice(indexOfNextObjectId, 1)
              }

              // removing the current object id from the nextObject's prevObject id arrays
              if (nextObjectId && objectData.current[nextObjectId]?.properties.prevObject.includes(obj.id)){
                  const indexOfCurrentObjectId = objectData.current[nextObjectId].properties.prevObject.indexOf(obj.id)
                  objectData.current[nextObjectId].properties.prevObject.splice(indexOfCurrentObjectId, 1)
              }  
          }
          // 2. disconnection from the lines L coordinates
          else if ((!coordinateCheck || coordinateCheck === "L") && getCurrentLineNextObjectId === obj.id) {
              // remove current obj id as the line's nextObject 
              objectData.current[line.id].properties.nextObject = []

              // getting the line's prevObject id
              const prevObjectId = objectData.current[line.id].properties.prevObject[0]


              // removing the prev object from the current object  previous object attribute in case there's a prevObjectId
              if (prevObjectId && objectData.current[obj.id]?.properties.prevObject.includes(prevObjectId)) {
                  const getPrevObjectIndex = objectData.current[obj.id].properties.prevObject.indexOf(prevObjectId)
                  objectData.current[obj.id].properties.prevObject.splice(getPrevObjectIndex, 1)
              }

              // removing the current object id from the prevObject's nextObject id arrays
              if (prevObjectId && objectData.current[prevObjectId]?.properties.nextObject.includes(obj.id)) {
                  const getNextObjectIndex = objectData.current[prevObjectId].properties.nextObject.indexOf(obj.id)
                  objectData.current[prevObjectId].properties.nextObject.splice(getNextObjectIndex, 1)
              }

          }

          // 3. no connection existed in the first place 
          // Nothing happens
    }, [objectData])


    const componentToLineConnection = useCallback((obj: HTMLElement, line: HTMLElement, type: string | null,  coordinateCheck?: "M" | "L") => {
      // Connection between component/object -> line and line -> component/object
      let isConnected = false // to keep track of disconnections
      const objectOffsetX = obj.offsetLeft
      const objectOffsetY = obj.offsetTop
      const objectOffsetYBottom = obj.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
      const objectOffsetXRight = obj.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
      const objectHeight = obj.getBoundingClientRect().height
      const objectWidth = obj.getBoundingClientRect().width
      const offsetLineX = (line as HTMLElement).offsetLeft
      const offsetLineY = (line as HTMLElement).offsetTop
      const lineData = objectData.current[line.id].properties.coordinates
      const coordinates = lineData.lineCoordinates!
      const M = coordinates.M
      const L = coordinates.L[coordinates.L.length - 1]
      const mXAxis = M[0] + offsetLineX
      const mYAxis = M[1] + offsetLineY
      const lXAxis = L[0] + offsetLineX
      const lYAxis = L[1] + offsetLineY


    

      // M COORDINATE CHECKS 

    
      
      if (!coordinateCheck || coordinateCheck === "M") {

        // Scenario 1:
            // Dragging a component from the bottom to the M-coordinate of a line
            // or
            // Dragging the M-coordinate of a line to the top side of a component
        if (objectOffsetY === mYAxis || ((mYAxis - objectOffsetY >= -10) &&  mYAxis < objectOffsetYBottom)) {
            if ((objectOffsetX <= mXAxis && objectOffsetXRight >= mXAxis) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
                isConnected = true
  
                if (!type) 
                    return isConnected
                if (mYAxis < objectOffsetY) {
                    if (type === "shapeToLine") {
                        const newObjectOffsetY = parseFloat((mYAxis).toFixed(6))
                        if (newObjectOffsetY < 6)
                            return
                        obj.style.top = `${newObjectOffsetY}px`;
                        objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetY = parseFloat((objectOffsetY - M[1]).toFixed(6))
                        if (newLineOffsetY < 6)
                            return
  
                        line.style.top = `${newLineOffsetY}px`;
                        objectData.current[line.id].properties.coordinates.lastY = newLineOffsetY
                    
                    }
                }
                MCoordinateConnection(obj, line)
            }
        }
  
  
        // Scenario 2:
  
            // Dragging a component from the top to the M-coordinate of a line
            // or
            // Dragging the M-coordinate of a line to the bottom side of a component
  
        if (objectOffsetYBottom === mYAxis || ((mYAxis - objectOffsetYBottom) <= 10 && (mYAxis > objectOffsetY) )) {
  
            if ((mXAxis >= objectOffsetX && mXAxis <= objectOffsetXRight) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
               
                isConnected = true
  
                if (!type) 
                    return isConnected
  
            
                // const objWidthMidpoint = objectWidth / 2
                // const newObjectOffsetX = mXAxis - objWidthMidpoint + (extrasX/2)
                if (mYAxis > objectOffsetYBottom) {
  
                    if (type === "shapeToLine")
                    {
                        const newObjectOffsetY = parseFloat((mYAxis - objectHeight).toFixed(6))
                        if (newObjectOffsetY < 6)
                            return
                        obj.style.top = `${newObjectOffsetY}px`;
                        // obj.style.left = `${newObjectOffsetX}px`;
                        // objectData.current[obj.id].lastX = newObjectOffsetX
                        objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetY = parseFloat((objectOffsetYBottom - M[1]).toFixed(6))
                        if (newLineOffsetY < 6)
                            return
            
                        line.style.top = `${newLineOffsetY}px`;
  
                        objectData.current[line.id].properties.coordinates.lastY = newLineOffsetY
  
                    }
                }
      
                MCoordinateConnection(obj, line)
  
            }
        }
  
  
        // Scenario 3
            // Dragging a component from the left to the M-coordinate of a line
            // or
            // Dragging the M-coordinate of a line to right side of a component
        if (objectOffsetXRight === mXAxis || ((mXAxis - objectOffsetXRight) <= 10  && (mXAxis > objectOffsetX) )) {
            if ((mYAxis >= objectOffsetY && mYAxis <= objectOffsetYBottom) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
                isConnected = true
               
                if (!type) 
                    return isConnected
  
                if (mXAxis > objectOffsetXRight) {
  
                    if (type === "shapeToLine") {
  
                        // const objHeightMidpoint = objectHeight / 2
                        const newObjectOffsetX = parseFloat((mXAxis - objectWidth).toFixed(6))
                        // const newObjectOffsetY = mYAxis - objHeightMidpoint + (extrasY/2)
                        if (newObjectOffsetX < 6)
                            return
                        // obj.style.top = `${newObjectOffsetY}px`;
                        obj.style.left = `${newObjectOffsetX}px`;
                        objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                        // objectData.current[obj.id].lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetX = parseFloat((objectOffsetXRight - M[0]).toFixed(6))
              
                        if (newLineOffsetX < 6)
                            return
                        // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - M[1] - (extrasY/2)
                        // obj.style.top = `${newLineOffsetY}px`;
                        line.style.left = `${newLineOffsetX}px`;
                        objectData.current[line.id].properties.coordinates.lastX = newLineOffsetX
                        // objectData.current[obj.id].lastY = newLineOffsetY
                    }
  
                }
  
  
                MCoordinateConnection(obj, line)
  
            }
        }
  
  
        // Scenario 4
            // Dragging a component from the right to the M-coordinate of a line
            // or
            // Dragging the M-coordinate of a line to left side of a component
  
        if (objectOffsetX === mXAxis || ((mXAxis - objectOffsetX) >= -10 && (mXAxis < objectOffsetXRight) )) {
            // Dragging the object in from the right (for M coordinates)
            if ((mYAxis >= objectOffsetY && mYAxis <= objectOffsetYBottom) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
  
                isConnected = true
               
                if (!type) 
                    return isConnected
                // const objHeightMidpoint = objectHeight / 2
  
                if (mXAxis < objectOffsetX) {
  
                    if (type === "shapeToLine")
                    {
  
                        const newObjectOffsetX = parseFloat((mXAxis).toFixed(6))
  
                        if (newObjectOffsetX < 6)
                            return;
                        // const newObjectOffsetY = mYAxis - objHeightMidpoint + (extrasY/2)
                        // obj.style.top = `${newObjectOffsetY}px`;
                        
                        obj.style.left = `${newObjectOffsetX}px`;
                        objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                        // objectData.current[obj.id].lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetX = parseFloat((objectOffsetX - M[0]).toFixed(6))
                        // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - M[1] - (extrasY/2)
                        if (newLineOffsetX < 6)
                            return
                        // obj.style.top = `${newLineOffsetY}px`;
                        line.style.left = `${newLineOffsetX}px`;
                        objectData.current[line.id].properties.coordinates.lastX = newLineOffsetX
                    }
                }
  
                
                MCoordinateConnection(obj, line)
  
            }
        }
      }

      // L COORDINATE CHECKS

      if (!coordinateCheck || coordinateCheck === "L") {

        // Scenario 5
            // Dragging a component from the top to the L-coordinate of a line
            // or
            // Dragging the L-coordinate of a line to the bottom side of a component
        if (objectOffsetYBottom === lYAxis || ((lYAxis -  objectOffsetYBottom) <= 10 && (lYAxis > objectOffsetY))) {
    
            if ((lXAxis >= objectOffsetX && lXAxis <= objectOffsetXRight) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
                isConnected = true
                
                if (!type) 
                    return isConnected
                if (lYAxis > objectOffsetYBottom) {
                    if (type === "shapeToLine") {
                        const newObjectOffsetY = parseFloat((lYAxis - objectHeight).toFixed(6))
                        obj.style.top = `${newObjectOffsetY}px`;
                        objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetY = parseFloat((objectOffsetYBottom - L[1]).toFixed(6))
                        line.style.top = `${newLineOffsetY}px`;
                        objectData.current[line.id].properties.coordinates.lastY = newLineOffsetY
              
                    }
                }
                LCoordinateConnection(obj, line)
            }
        }
  
  
        // Scenario 6
            // Dragging a component from the bottom to the L-coordinate of a line
            // or
            // Dragging the L-coordinate of a line to the top side of a component
        if (objectOffsetY === lYAxis || ((lYAxis - objectOffsetY) >= -10 && (lYAxis < objectOffsetYBottom) )) {
  
            if ((lXAxis >= objectOffsetX && lXAxis <= objectOffsetXRight) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
                
                isConnected = true
              
                if (!type) 
                    return isConnected
                // const objWidthMidpoint = objectWidth / 2
                // const newObjectOffsetX = lXAxis - objWidthMidpoint + (extrasX/2)
                if (lYAxis < objectOffsetY) {
  
                    if (type === "shapeToLine") {
  
                        const newObjectOffsetY = parseFloat((lYAxis).toFixed(6))
                        if (newObjectOffsetY < 6)
                            return
                        obj.style.top = `${newObjectOffsetY}px`;
                        // obj.style.left = `${newObjectOffsetX}px`;
                        // objectData.current[obj.id].lastX = newObjectOffsetX
                        objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetY = parseFloat((objectOffsetY - L[1]).toFixed(6))
                        if (newLineOffsetY < 6)
                            return
                        line.style.top = `${newLineOffsetY}px`;
                        // obj.style.left = `${newLineOffsetX}px`;
                        // objectData.current[obj.id].lastX = newLineOffsetX
                        objectData.current[line.id].properties.coordinates.lastY = newLineOffsetY
                    }
                }
                LCoordinateConnection(obj, line)
                
            }
        }
  
  
        // Scenario 7
            // Dragging a component from the left to the L-coordinate of a line
            // or
            // Dragging the L-coordinate of a line to the right side of a component
        if (objectOffsetXRight === lXAxis || ((lXAxis - objectOffsetXRight) <= 10 && (lXAxis > objectOffsetX) )) {
  
            if ((lYAxis >= objectOffsetY && lYAxis <= objectOffsetYBottom) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
                isConnected = true
                
                if (!type) 
                    return isConnected
            
                // const objHeightMidpoint = objectHeight / 2
  
                if (lYAxis > objectOffsetXRight) {
                    if (type === "shapeToLine") {
  
                        const newObjectOffsetX = parseFloat((lXAxis - objectWidth).toFixed(6))
                        // const newObjectOffsetY = lYAxis - objHeightMidpoint + (extrasY/2)
                        if (newObjectOffsetX < 6)
                            return
                        // obj.style.top = `${newObjectOffsetY}px`;
                        obj.style.left = `${newObjectOffsetX}px`;
                        objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                        // objectData.current[obj.id].lastY = newObjectOffsetY
                    } else {
                        // const shapeHeightMidpoint = shapeHeight / 2
                        const newLineOffsetX = parseFloat((objectOffsetXRight - L[0]).toFixed(6))
                        // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - L[1] - (extrasY/2)
                        // obj.style.top = `${newLineOffsetY}px`;
                        if (newLineOffsetX < 6)
                            return
                        line.style.left = `${newLineOffsetX}px`;
                        objectData.current[line.id].properties.coordinates.lastX = newLineOffsetX
                        // objectData.current[obj.id].lastY = newLineOffsetY
                
                    }
  
                }
  
  
                LCoordinateConnection(obj, line)
            }
        }
  
        // Scenario 8
            // Dragging a component from the right to the L-coordinate of a line
            // or 
            // Dragging the L-coordinate of a line to the left side of a component
        if (objectOffsetX === lXAxis || ((lXAxis - objectOffsetX) >= -10 && (lXAxis < objectOffsetXRight) )) {
            
            if ((lYAxis >= objectOffsetY && lYAxis <= objectOffsetYBottom) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
                isConnected = true
                
                if (!type) 
                    return isConnected
                // const objHeightMidpoint = objectHeight / 2
  
                if (lXAxis < objectOffsetX) {
  
                    if (type === "shapeToLine") {
  
                        const newObjectOffsetX = parseFloat((lXAxis).toFixed(6))
                        // const newObjectOffsetY = lYAxis - objHeightMidpoint + (extrasY/2)
                        // obj.style.top = `${newObjectOffsetY}px`;
                        obj.style.left = `${newObjectOffsetX}px`;
                        objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                    // objectData.current[obj.id].lastY = newObjectOffsetY
                    } else {
                        const newLineOffsetX = parseFloat((objectOffsetX - L[0]).toFixed(6))
                        // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - L[1] - (extrasY/2)
                        if (newLineOffsetX < 6)
                            return
                        // obj.style.top = `${newLineOffsetY}px`;
                        line.style.left = `${newLineOffsetX}px`;
                        objectData.current[line.id].properties.coordinates.lastX = newLineOffsetX
                        // objectData.current[obj.id].lastY = newLineOffsetY
                    }
                }
                LCoordinateConnection(obj, line)
            }
        }
      }




      // check if there's disconnection between the lines and the shape
          // isConnected doesn't mean that there's an active connection or valid connection
          // it just means that the line and the current shape (obj) are in contact or within range
          // it's not a check for validating a "from and to" of a line connection together..

      if (!isConnected) {
        cleanUpInvalidConnections(line, obj, coordinateCheck)
          
      }

      return isConnected

    }, [objectData, canvasRef, checkAndSetConnection, MCoordinateConnection, LCoordinateConnection, cleanUpInvalidConnections])




    const showAndValidateLineConnection = useCallback((line: HTMLElement) => {
        const path = line.querySelector("svg.line-svg path")
        const arrow = line.querySelector("svg.arrow-indicator polygon") as SVGPolygonElement
        if (objectData.current[line.id].properties.nextObject[0] && objectData.current[line.id].properties.prevObject[0]) {
            // here's the check for a valid connection

            // A check to ensure to ensure both the previous and next objects are within the right range.
            const prevObjectElement = document.getElementById(objectData.current[line.id].properties.prevObject[0])
            const nextObjectElement = document.getElementById(objectData.current[line.id].properties.nextObject[0])

            const isPrevObjConnected = prevObjectElement && componentToLineConnection(prevObjectElement, line, null, "M")
            const isNextObjConnected = nextObjectElement && componentToLineConnection(nextObjectElement, line, null, "L")
              

            if (isPrevObjConnected && isNextObjConnected) {
                if (path!.getAttribute("stroke") !== "#4D4D4D" && arrow!.getAttribute("fill") !== "#4D4D4D") {
                    path!.setAttribute("stroke", "#4D4D4D")
                    arrow.setAttribute("fill", "#4D4D4D")
                    setIsEdited(true)
                }
               
                return;
            }

        }

        if (path!.getAttribute("stroke") !== "#beb4b4" && arrow!.getAttribute("fill") !== "#beb4b4") {
            setIsEdited(true)
            path!.setAttribute("stroke", "#beb4b4")
            arrow.setAttribute("fill", "#beb4b4")
        }

    }, [componentToLineConnection, objectData, setIsEdited])



    const DrawLineToShape = useCallback((obj: HTMLElement, point: HTMLSpanElement) => {
      for (const shapeId in objectData.current) {
        // if the obj is the same as the current shape iteration then continue (i.e not supporting line joining to itself)
        if (obj.id === shapeId)
          continue
        const shape = document.getElementById(shapeId) as HTMLElement;
        if (!shape) continue

        // if the shape is a text or line we skip, (line to line or line to text connection is not supported for now)
        if (shape.getAttribute("data-variant") === "text"  || shape.getAttribute("data-variant") === "line")
          continue
        
        const pointMetadata = pointStore.current[point.id]
        if (pointMetadata[1][0] === "M") continue // Not likely possible but we still check
        if (pointMetadata[1].length > 2) continue // Must be the last point

        let isConnected = false
        const shapeOffsetX = shape.offsetLeft
        const shapeOffsetY = shape.offsetTop
        const shapeOffsetYBottom = shape.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
        const shapeOffsetXRight = shape.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
        const shapeWidth =  shape.getBoundingClientRect().width
        const shapeHeight =  shape.getBoundingClientRect().height


        const path = obj.querySelector("svg.line-svg path")
        const arrowContainer = obj.querySelector("svg.arrow-indicator") as SVGElement
        const arrow = arrowContainer.querySelector("polygon") as SVGPolygonElement
        const offsetLineX = obj.offsetLeft
        const offsetLineY = obj.offsetTop
        const lineData = objectData.current[obj.id].properties.coordinates
        const coordinates = lineData.lineCoordinates!
        const L = coordinates.L[coordinates.L.length - 1]
        const lXAxis = L[0] + offsetLineX
        const lYAxis = L[1] + offsetLineY
        // We need to account for the following scenarios
        // drawing the line to connect from the top
        // drawing the line to connect from the bottom
        // drawing the line to connect from the right
        // drawing the line to connect fromt the left

        // scenario 1: Drawing from the top:
        if (lYAxis === shapeOffsetY || ((lYAxis - shapeOffsetY) >= -10 && (lYAxis < shapeOffsetYBottom) )) {

          if ((lXAxis >= shapeOffsetX && lXAxis <= shapeOffsetXRight) && checkAndSetConnection("to", obj.id, shapeId)) {
            
            isConnected = true
            // Ensure the point is within the box range on x axis
            if (lYAxis < shapeOffsetY) {
              const pointGap = shapeOffsetY - lYAxis           
              coordinates.L[coordinates.L.length - 1][1] = parseFloat((L[1] + pointGap).toFixed(6))
              const pathDString = LineCoordinateToPathString(coordinates)
              point.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
              arrowContainer.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
              path?.setAttribute("d", pathDString)
            }            
            
            LCoordinateConnection(shape, obj)
          }
        }

        
        // scenario 2: Drawing from the bottom
        if (lYAxis === shapeOffsetYBottom ||  ((lYAxis - shapeOffsetYBottom) <= 10 && (lYAxis > shapeOffsetY) )) {


          
          if ((lXAxis >= shapeOffsetX && lXAxis <= shapeOffsetXRight) && checkAndSetConnection("to", obj.id, shapeId)) {
            isConnected = true
            if (lYAxis > shapeOffsetYBottom) {

              // Ensure the point is within the box range on x axis
              const pointGap = shapeOffsetYBottom - lYAxis
              coordinates.L[coordinates.L.length - 1][1] = parseFloat((L[1] + pointGap).toFixed(6))
              const pathDString = LineCoordinateToPathString(coordinates)
              point.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
              arrowContainer.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
              path?.setAttribute("d", pathDString)
            }


            LCoordinateConnection(shape, obj)

          }
        }

        // scenario 3: Drawing from the right

        if (lXAxis === shapeOffsetXRight || ((lXAxis - shapeOffsetXRight) <= 10 && (lXAxis > shapeOffsetX) )) {
          if ((lYAxis >= shapeOffsetY && lYAxis <= shapeOffsetYBottom) && checkAndSetConnection("to", obj.id, shapeId)) {
            isConnected = true

            if (lXAxis > shapeOffsetXRight) {

              // Ensure the point is within the box range on y axis
              const pointGap = shapeOffsetXRight - lXAxis
              coordinates.L[coordinates.L.length - 1][0] = parseFloat((L[0] + pointGap).toFixed(6))
              const pathDString = LineCoordinateToPathString(coordinates)
              
              point.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
              arrowContainer.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
              path?.setAttribute("d", pathDString)
            }


            LCoordinateConnection(shape, obj)

          }
        }

        // scenario 4: Drawing from the left

        if (lXAxis === shapeOffsetX || ((lXAxis - shapeOffsetX) >= -10 && (lXAxis < shapeOffsetXRight) )) {
          if ((lYAxis >= shapeOffsetY && lYAxis <= shapeOffsetYBottom) && checkAndSetConnection("to", obj.id, shapeId)) {
            isConnected = true

            if (lXAxis < shapeOffsetX) {

              // Ensure the point is within the box range on y axis
              const pointGap = shapeOffsetX - lXAxis
              coordinates.L[coordinates.L.length - 1][0] = parseFloat((L[0] + pointGap).toFixed(6))
              const pathDString = LineCoordinateToPathString(coordinates)
              point.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
              arrowContainer.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
              path?.setAttribute("d", pathDString)
            }


            LCoordinateConnection(shape, obj)

          }
        }

        if (!isConnected) {
            const getObjNextObject = objectData.current[obj.id].properties.nextObject[0];
            
            if (getObjNextObject && !objectData.current[getObjNextObject]) {
              objectData.current[obj.id].properties.nextObject = []
            }
            else if (getObjNextObject === shapeId) {
              objectData.current[obj.id].properties.nextObject = []
              const prevObject = objectData.current[obj.id].properties.prevObject[0]
              if (prevObject && objectData.current[shapeId]?.properties.prevObject.includes(prevObject)) {
                const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
              }
              if (prevObject && objectData.current[prevObject]?.properties.nextObject.includes(shapeId)) {
                const getNextObjectIndex = objectData.current[prevObject].properties.nextObject.indexOf(shapeId)
                objectData.current[prevObject].properties.nextObject.splice(getNextObjectIndex, 1)

              }
            } 

        }

        // console.log('is connected', isConnected)
      
        if (objectData.current[obj.id].properties.nextObject[0] && objectData.current[obj.id].properties.prevObject[0]) {
          path!.setAttribute("stroke", "#4D4D4D")
          arrow.setAttribute("fill", "#4D4D4D")
        } else {
          path!.setAttribute("stroke", "#beb4b4")
          arrow.setAttribute("fill", "#beb4b4")

        }
      }
    }, [objectData,canvasRef, checkAndSetConnection, LCoordinateConnection])



    const LineToShape = useCallback((obj: HTMLElement) => {
      for (const shapeId in objectData.current) {
        if (obj.id === shapeId)
          continue
        const shape = document.getElementById(shapeId) as HTMLElement;
        if (!shape) continue

        // console.log("data variant", shape.getAttribute("data-variant"))
        if (shape.getAttribute("data-variant") === "text" || shape.getAttribute("data-variant") === "line")
          continue

      

        componentToLineConnection(shape, obj, "lineToShape")
        showAndValidateLineConnection(obj)
        

      }
    }, [componentToLineConnection, showAndValidateLineConnection, objectData])





    const ShapeToLine = useCallback((obj: HTMLElement, isDeleted: Boolean = false) => {

        // Get all the lines
        const lines = document.querySelectorAll("[data-variant=line]")
        lines.forEach(line => {
          // For Each line check if object is within proximity
          if (isDeleted)
            cleanUpInvalidConnections(line as HTMLElement, obj)
          else 
            componentToLineConnection(obj, line as HTMLElement, "shapeToLine")
          
          showAndValidateLineConnection(line as HTMLElement)

          
        })
    }, [componentToLineConnection, showAndValidateLineConnection, cleanUpInvalidConnections])


    const LineConnector = useCallback((obj: HTMLElement, point?: HTMLSpanElement) => {
      if (point) {
        // Catch the event of drawing a line to shape/object from its pivot (only the L coordinates is adjusted)
        // If it's a point here are some facts
        // We'll be working with the L coordinates of the path element
        // obj is definitely a line
        DrawLineToShape(obj, point)
      } else {
        if (obj.getAttribute("data-variant") !== "line" && obj.getAttribute("data-variant") !== "text") {
          // Catch the event of dragging a shape or object to a line
          // Connect shape to lines
          ShapeToLine(obj)
        } else if (obj.getAttribute("data-variant") === "line") {
          // Catch the event of dragging a line to a shape or object
          // Connect line to shapes
          LineToShape(obj)
        }
      }
      
      
    }, [DrawLineToShape, LineToShape, ShapeToLine])

    const checkLineBoundary = (e: MouseEvent, obj: HTMLElement) => {
      const pointIndicators = obj.querySelectorAll(".point-indicators")
      const coords: {offsetLeft: number, offsetTop: number, offsetLeftEnd: number, offsetTopEnd: number} = {offsetLeft: 0, offsetTop: 0, offsetLeftEnd: 0, offsetTopEnd: 0} 
      const pointIndicatorArray = Array.from(pointIndicators)
      const objOffsetLeft = obj.offsetLeft
      const objOffsetTop = obj.offsetTop

      for (const point of pointIndicatorArray) {

        if ((objOffsetLeft + (point as HTMLElement).offsetLeft) < 7 || (objOffsetTop + (point as HTMLElement).offsetTop) < 7) {
          // 7 here is arbitrary for padding
            // console.log("object offset left", objOffsetLeft, "point offset left", (point as HTMLElement).offsetLeft)

          if ((objOffsetLeft + (point as HTMLElement).offsetLeft) < 7)
            coords.offsetLeft = Math.abs((point as HTMLElement).offsetLeft) + 6
          if ((objOffsetTop + (point as HTMLElement).offsetTop) < 7)
            coords.offsetTop = Math.abs((point as HTMLElement).offsetTop) + 6
          
        } else if ((objOffsetLeft + (point as HTMLElement).offsetLeft) > (canvasContainerContentWidth - 20) || (objOffsetTop + (point as HTMLElement).offsetTop) > (canvasContainerContentHeight - 20)) {
            // console.log("additon", (objOffsetLeft + (point as HTMLElement).offsetLeft))
        
          if ((objOffsetLeft + (point as HTMLElement).offsetLeft) > (canvasContainerContentWidth - 20)) {

            coords.offsetLeftEnd = canvasContainerContentWidth - Math.abs((point as HTMLElement).offsetLeft) - 10            
          }
          if ((objOffsetTop + (point as HTMLElement).offsetTop) > (canvasContainerContentHeight - 20)) {
            coords.offsetTopEnd = canvasContainerContentHeight - Math.abs((point as HTMLElement).offsetTop) - 10
          }
        }
      }
      // console.log("coords", coords)
      return coords
    }

    const LineCoordinateToPathString = (lineCoordinates: lineCordsType): string => {
      const mPath = "M".concat(lineCoordinates.M.join(" "))


      let lPath = ""
      lineCoordinates.L.forEach(c => {
        lPath = lPath.concat("L".concat(c.join(" ")))
        lPath += " "
    
      })
      lPath = lPath.substring(0, lPath.length - 1)
      return mPath + " " + lPath
    }

    const getTheta = (x1: number, x2: number, y1: number, y2: number) => {
      let orientation = 90
      if (x2 < x1) orientation = 270
      const gradient = (y2 - y1) / (x2 - x1)
      const theta = (Math.atan(gradient) * 180 / Math.PI)
      
      return theta - orientation
    }

    const DrawPoint = useCallback((e: MouseEvent, point: HTMLElement) => {
      // const 
      // console.log("draw point", e, point)
      const containerX = canvasRef.current.getBoundingClientRect().x
      const containerY = canvasRef.current.getBoundingClientRect().y
      if ((e.clientX - containerX) < 7 || (e.clientY - containerY) < 7) {
        return
      }

      let isLast = false // if point is the last point
      const object = currentObject.current
      const objectX = object.getBoundingClientRect().x
      const objectY = object.getBoundingClientRect().y
      const pointX = parseFloat((e.clientX - objectX).toFixed(6))
      const pointY = parseFloat((e.clientY - objectY).toFixed(6))
      const pointID = pointStore.current[point.id]
      const pointDetails = pointID[1] // point here is expected to be ["L", :any number]
      // console.log('object', object)
      // console.log('pointX', pointX)
      // console.log('pointY', pointY)
      // console.log("pointId", pointID)
      // console.log("point details", pointDetails)
      // console.log('pointStore', pointStore)
     
      const objectDetails = objectData.current[object.id].properties.coordinates
      // console.log('objectDetails', objectDetails)


      // there's an error here...

      objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] = [pointX, pointY]
      point.style.left = `${pointX}px`
      point.style.top = `${pointY}px`
      const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
      const path = object.querySelector("svg.line-svg path")
      path?.setAttribute("d", coordString)
      // arrow
      const arrow = object.querySelector("svg.arrow-indicator")! as SVGElement

      let otherPoint: string, otherPointDetails: ["M"] | ["L", number, number?]
     
      if (pointDetails.length && pointDetails[0] === "L" && pointDetails.length < 3 && pointID[0].next === null) {
        isLast = true
        arrow.style.left = `${pointX}px`
        arrow.style.top = `${pointY}px`
        otherPoint = pointID[0].prev as string
        otherPointDetails = pointStore.current[otherPoint][1]
      } else {
        if (pointID[0].next) {
          otherPoint = pointID[0].next
          const otherPointID = pointStore.current[otherPoint]
          otherPointDetails = otherPointID[1]
          if (!(otherPointID[0].next === null && otherPointDetails.length < 3)) {
            return;
          }
        } else return;
      }

      
      // console.log("prevpoint details", prevPointDetails, prevPoint)
      let x1: number, y1: number, x2: number, y2: number;

      
      

      if (otherPointDetails[0] === "M") {
        [x1, y1] = objectDetails.lineCoordinates![otherPointDetails[0]] as [number, number]
      } else {
        [x1, y1] = objectDetails.lineCoordinates![otherPointDetails[0]][otherPointDetails[1]!] as [number, number]
      }

      if (isLast) {
        x2 = pointX
        y2 = pointY
      } else {
        x2 = x1
        y2 = y1
        x1 = pointX
        y1 = pointY
      }
      
      const theta = getTheta(x1, x2, y1, y2)
      arrow.style.transform = `translate(-50%, -100%) rotate(${theta}deg)`

      // 
    }, [objectData, canvasRef])



    const handleShapeDelete = useCallback((e: KeyboardEvent, element: HTMLElement) => {
      if (e.keyCode === 8 || e.keyCode === 46) {
        element.remove()
        // Send a delete request to the backend to update the delete (if already created by check if there is an id field)
        objectLabels.current.delete(objectData.current[element.id].label)
        if (objectData.current[element.id].properties.crusherType === "primary") 
          primaryCrusherInUse.current = false

        if (eventElementSet.current.has(element)) {
          const elRemove = elementEventHandlers.current.get(element)
          elRemove?.forEach((handlerFn, event) => {
            element.removeEventListener(event, handlerFn as EventListenerOrEventListenerObject)
          })
          eventElementSet.current.delete(element)
          elementEventHandlers.current.delete(element)
        }

        delete objectData.current[element.id]

        if (element.getAttribute("data-variant") !== "line") {
          ShapeToLine(element, true)
        }
        setIsEdited(true)
      }
    }, [objectData, setIsEdited, ShapeToLine])



    const handleDblClick = (e: MouseEvent, element: HTMLElement) => {
      const parentElement = element.closest(".text-object-container") as HTMLDivElement
      element.setAttribute("contenteditable", "true")
      parentElement.style.border = "1px solid #006644"
      parentElement.querySelectorAll(".text-panel").forEach(el=>el.classList.add("text-panel-show"))
      parentElement.querySelector(".text-control-panel")?.classList.add("text-control-panel-show")

      
    }



    const handleMouseUpUtil = useCallback(() => {
      if (onPanelResize.current || onMouseDown.current) {
        if (mouseMoved.current) setIsEdited(true)
      }
      if (onPanelResize.current) {
        onPanelResize.current = false
        const obj = currentObject.current
        const objData = objectData.current[obj.id]
        objData.scale = {x: panelResizeScaleMarker.current.x, y: panelResizeScaleMarker.current.y}
        objData.x_coordinate = panelObjectOffsetStart.current.x
        objData.y_coordinate = panelObjectOffsetStart.current.y 
        objData.properties.coordinates.lastX = panelObjectOffsetStart.current.x
        objData.properties.coordinates.lastY = panelObjectOffsetStart.current.y
        
      }
      if (onMouseDown.current) {
          // currentObject.current.classList.remove("current-object")
          const obj = currentObject.current
          if (currentActivePoint.current) {
            currentActivePoint.current.style.transform = "scale(1.0) translate(-50%, -50%)"
            LineConnector(obj, currentActivePoint.current)
            currentActivePoint.current = null
            eventTracker.current.mouseUpEventInvoked.point = undefined

          } else if (obj) {
            objectData.current[obj.id].properties.coordinates.lastX = parseFloat((obj?.offsetLeft as number).toFixed(6))
            objectData.current[obj.id].properties.coordinates.lastY = parseFloat((obj?.offsetTop as number).toFixed(6))
            objectData.current[obj.id].x_coordinate = parseFloat((obj?.offsetLeft as number).toFixed(6))
            objectData.current[obj.id].y_coordinate = parseFloat((obj?.offsetTop as number).toFixed(6))
            LineConnector(obj)
          }
          // console.log(objectData.current)
          const tooltip = obj?.querySelector(".object-details-tooltip")

          tooltip?.classList.remove("show-tooltip")
          tooltip?.classList.add("hide-tooltip")
          
      }
      onMouseDown.current = false
      mouseMoved.current = false
      eventTracker.current.mouseUpEventInvoked = {status: false, event: null, element: undefined}
      eventTracker.current.generalMouseUpEventInvoked = {status: false, event: null}
    }, [LineConnector, objectData, setIsEdited])

    const handleMouseUpGeneral = useCallback((e: MouseEvent | null) => {
      if (!e) return
      // console.log('mouse up called in general ', onPanelResize.current, "mouse down", onMouseDown.current)
      handleMouseUpUtil()
    },[handleMouseUpUtil])
    

    const handleMouseDown = useCallback((e: MouseEvent | null, obj: HTMLElement) => {
      if (!e) return
      // console.log("event target", e.target)
      // console.log("obj", obj)e

      const pointIndictator = eventTracker.current.mouseDownEventInvoked.point 
  

      if ((pointIndictator || obj)?.classList.contains("point-indicators")) {
         // if pointIndicator is not null it comes of the (pointIndictator || obj) expression
          // if it gets here either pointIndicator or obj has the class hence we use the OR operator
          currentActivePoint.current = (pointIndictator || obj) as HTMLSpanElement
          (pointIndictator || obj).style.transform = "scale(1.5) translate(-40%, -40%)"
          eventTracker.current.mouseDownEventInvoked.point = undefined
          // console.log(e.clientX, e.clientY)
      } else {
          currentObject.current?.classList.remove("current-object")
          prevActiveObject.current = currentObject.current
          currentObject.current = obj
          currentObject.current.classList.add("current-object")
          
          objectData.current[obj.id].properties.coordinates.startX = parseFloat(e.clientX.toFixed(6))
          objectData.current[obj.id].properties.coordinates.startY = parseFloat(e.clientY.toFixed(6))
      }
      // currentObject.current?.querySelector(".object-details-tooltip")?.classList.add("show-tooltip")
      onMouseDown.current = true
      document.removeEventListener("mouseup", documentMouseUpHandler)
      eventTracker.current.mouseDownEventInvoked = {status: false, event: null, element: null}

      // console.log(e)
    }, [objectData])
    
    const handleMouseUp = useCallback((e: MouseEvent | null, obj?: HTMLElement) => {
      if (!e) return
      // console.log("called mouseup in mouseup !!!", onPanelResize.current, "mouse down", onMouseDown.current)
      if (onMouseDown.current || onPanelResize.current) {
        document.removeEventListener("mouseup", documentMouseUpHandler)
      }
      handleMouseUpUtil()
      

      if (calculateBondsEnergy.current && obj){
        if (["Grinder", "Crusher"].includes(objectData.current[obj.id].object_info.object_model_name)) {
          communitionListForBondsEnergy.current.push(objectData.current[obj.id])
          if (communitionListForBondsEnergy.current.length >= 2) {
            // console.log("calcuate bonds energy", communitionListForBondsEnergy.current)
            calculateBondsEnergy.current = false
            // Calculate it here
            calculateEnergyUsed()
          }
        }
      }

      
    }, [handleMouseUpUtil, objectData,calculateBondsEnergy, communitionListForBondsEnergy, calculateEnergyUsed])


    // generic handlers

    const documentMouseUpHandler = (e: MouseEvent) => {
          eventTracker.current.generalMouseUpEventInvoked = {status: true, event: e}
    }

    // connector point handlers
    const pointMouseDownHandler = (newPoint: HTMLSpanElement) => {
      return (e: MouseEvent) => {
        eventTracker.current.mouseDownEventInvoked = {status: true, event: e, element: null, point: newPoint}
      }
    }
    const pointMouseUpHandler = (newPoint: HTMLSpanElement) => {
      return (e: MouseEvent) => {
        eventTracker.current.mouseUpEventInvoked = {status: true, event: e, point: newPoint}
      }
    }
    const pointDblClickHandler = (newPoint: HTMLSpanElement) => {
      return (e: MouseEvent) => {
        eventTracker.current.createMultiplePointEventInvoked = {status: true, event: e, element: newPoint}
      }
    }

    // resize panels mouse down handlers
    const panelMouseDownHandler = (panel: HTMLSpanElement) => {
      return (e: MouseEvent)=> {
            eventTracker.current.panelMouseDownEventInvoked = {status: true, event: e, element: panel}
          }
    }

    // component handlers

    const componentMouseDownHandler = (newEl: HTMLElement) => {
      // console.log(newEl)
      return (e: MouseEvent) => {
          eventTracker.current.mouseDownEventInvoked = {
            ...eventTracker.current.mouseDownEventInvoked, 
            status: true, event: e, element: newEl
          }
        }
    }
    const componentMouseUpHandler = (newEl: HTMLElement) => {
      return (e: MouseEvent) => {
           eventTracker.current.mouseUpEventInvoked = {
            ...eventTracker.current.mouseUpEventInvoked,
            status: true, event: e, element: newEl
          }
        }
    }

    const componentMouseLeaveHandler = (newEl: HTMLElement, tooltipWrapper: HTMLElement) => {
      return (e: MouseEvent)=> {
            tooltipWrapper.classList.remove("show-tooltip")
            tooltipWrapper.classList.add("hide-tooltip")
            newEl.classList.remove('object-hover')
            if (newEl.id !== currentObject.current?.id)
              newEl.classList.remove("current-object")
          }
    }

    const componentFocusHandler = (resizePanels: NodeListOf<Element>, newEl: HTMLElement) => {
      return (e: FocusEvent) => {
            newEl.style.outline = "2px solid #006644";
            resizePanels.forEach(panel=> {
              panel.classList.add('resize-panel-show')
            })
          }
    }

    const componentFocusOutHandler = (resizePanels: NodeListOf<Element>, newEl: HTMLElement) => {
      return (e: FocusEvent)=> {
            (e.target as HTMLElement).style.outline = "none";
            resizePanels.forEach(panel=> {
              panel.classList.remove('resize-panel-show')
            })
          }
    }


    // control options click event handlers
    const controlOptionClickHandler = (textControlOptions: HTMLElement, controlOptionButton: HTMLImageElement) => {
      return (e: MouseEvent)=> {

          if (textControlOptions?.classList.contains("text-size-control-options-show")) {
            textControlOptions?.classList.remove("text-size-control-options-show")
            controlOptionButton.src = arrowDown.src
          } else {
            textControlOptions?.classList.add("text-size-control-options-show")
            controlOptionButton.src = arrowUp.src
          }
          
        }
    }

    const textControlOptionClickHandler = useCallback((textControlOptions: HTMLElement, newEl: HTMLElement, span: HTMLSpanElement, controlOptionButton: HTMLImageElement) => {
      return () => {
            const activeFont = textControlOptions?.querySelector("span.text-selected")
            objectData.current[newEl.id].font_size = parseInt(span.getAttribute("data-size") || "14")
            newEl.style.fontSize = `${objectData.current[newEl.id].font_size}px`

            let size_name;
            switch(objectData.current[newEl.id].font_size) {
              case 12:
                size_name = "Small"
                break
              case 14:
                size_name = "Medium"
                break
              case 16:
                size_name = "Large"
                break
              default:
                size_name = "Medium"
            }
            newEl.querySelector(".selected-size-name")!.textContent = size_name
            activeFont?.classList.remove("text-selected")
            span.classList.add("text-selected")
            textControlOptions?.classList.remove("text-size-control-options-show")
            controlOptionButton.src = arrowDown.src
        }
    }, [objectData])
    // Text controls mouse enter and mouse leave

    const textControlMouseEnterHandler = useCallback((newEl: HTMLElement) => {
      return ()=> {
        objectData.current[newEl.id].textActive = true
      }
    }, [objectData])

    const textControlMouseLeaveHandler = useCallback((newEl: HTMLElement) => {
      return () => {
        objectData.current[newEl.id].textActive = false
      }
    }, [objectData])

    // text input/contentEditable






    const createMultiplePoint = useCallback((e: MouseEvent | null, point: HTMLSpanElement | null) => {
      if (!e || !point) return
      // Ability of a line to have multiple breakpoints on a line instead of just the regular straight line (That's why we are using the svg path element)
      const pointDetails = pointStore.current[point.id][1]

      if (pointDetails.length && pointDetails[0] === "L" && pointDetails.length < 3) {
        const object = currentObject.current
        const newPoint = document.createElement("span")
        const newPointUid = "point-"+uuidv4()
        newPoint.classList.add("point-indicators")
        newPoint.setAttribute("id", newPointUid)



        const pMouseDownHandler =  pointMouseDownHandler(newPoint)
        const pMouseUpHandler = pointMouseUpHandler(newPoint)
        const pDblClickHandler = pointDblClickHandler(newPoint)
  
        let pMap = elementEventHandlers.current.get(newPoint)
        
        if (!pMap)
        {
          pMap = new Map()
          elementEventHandlers.current.set(newPoint, pMap)
          eventElementSet.current.add(newPoint)
        }
        pMap.set("mousedown", pMouseDownHandler)
        pMap.set("mouseup", pMouseUpHandler)
        pMap.set("dblclick", pDblClickHandler)
        newPoint.addEventListener("mousedown", pMouseDownHandler) 
        newPoint.addEventListener("mouseup", pMouseUpHandler)
        newPoint.addEventListener("dblclick", pDblClickHandler)
        newPoint.style.top = point.style.top
        newPoint.style.left = point.style.left
        
        const lineWrapEl = object.querySelector(".line-wrap") as HTMLDivElement
        lineWrapEl.appendChild(newPoint)
        const path = object.querySelector("svg.line-svg path")


        // update the pointStore.current for point.id to show there is a third point

        pointStore.current[point.id][1][2] = pointDetails[1]! + 1
        
        // Update the next uid of the current point.id to newPointUid
        pointStore.current[point.id][0].next = newPointUid

        // create a new pointStore.current for  newPoint
        pointStore.current[newPointUid] = [{prev: point.id, next: null}, ["L", pointStore.current[point.id][1][2]!]]


        // console.log("coordinate update")
        // update line coordinates
        const newPointDetails = pointStore.current[newPointUid][1]
        const objectDetails = objectData.current[object.id].properties.coordinates
        objectDetails.lineCoordinates![newPointDetails[0]][newPointDetails[1]!] = objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] as [number, number]
        const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
        path?.setAttribute("d", coordString)
        eventTracker.current.mouseDownEventInvoked = {status: true, event: e, element: null, point: newPoint}

      }

      eventTracker.current.createMultiplePointEventInvoked = {status: false, event: null, element: null}
    }, [objectData])



    const showPointVisibility = (e: FocusEvent | MouseEvent, element: HTMLElement) => {
      // on focus reveal each line breakpoints
      
      const indicators = element.querySelectorAll(".point-indicators")
      indicators.forEach(indicator => {
        indicator.classList.remove("hide-indicator")
      })
      // console.log("showing point visibilties")
    }

    const hidePointVisibility = (e: FocusEvent, element: HTMLElement) => {
      // on focus out hide line breakpoints
      const indicators = element.querySelectorAll(".point-indicators")
      indicators.forEach(indicator => {
        indicator.classList.add("hide-indicator")
      }) 
      // console.log("hiding point visibilities")
    }

    const handleInput = useCallback((e: KeyboardEvent) => {
      const element = e.target as HTMLElement
      const parentElementContainer = element.closest(".text-object-container")!
      
      if (element.innerHTML!.length === 0 && e.keyCode === 8 && element.classList.contains("placeholder-style")) {
        if (eventElementSet.current.has(element)) {
          const elRemove = elementEventHandlers.current.get(element)
          elRemove?.forEach((handlerFn, event) => {
            element.removeEventListener(event, handlerFn as EventListenerOrEventListenerObject)
          })
          eventElementSet.current.delete(element)
          elementEventHandlers.current.delete(element)
        }

        
        element.remove()
        // Send a delete request to the backend to update the delete (if already created by check if there is an id field)
        delete objectData.current[parentElementContainer.id]
      }
      
      if (element.innerHTML!.length > 0) element.classList.remove("placeholder-style")
      else {
        element.innerHTML = ""
        element.classList.add("placeholder-style")
      }              
    }, [objectData])
  

    const textFocusOut = useCallback((element: HTMLDivElement, contentEditableDiv: HTMLDivElement) => {
      const textControlOptions = element.querySelector(".text-size-control-options") as HTMLDivElement
      const controlOptionButton = element.querySelector(".open-control-options") as HTMLImageElement
    
      if (!objectData.current[element.id]?.textActive) {
        textControlOptions?.classList.remove("text-size-control-options-show")
        controlOptionButton.src = arrowDown.src
        contentEditableDiv.removeAttribute("contenteditable")
        contentEditableDiv.style.color = "#4D4D4D"
        element.style.border = "none"
        element.querySelectorAll(".text-panel").forEach(el=>el.classList.remove("text-panel-show"))
        element.querySelector(".text-control-panel")?.classList.remove("text-control-panel-show")
        if (contentEditableDiv.textContent!.length > 0)
          objectData.current[element.id].description = contentEditableDiv.innerHTML!
      }
    }, [objectData])





    const showObjectDetailsToolTip = useCallback((element: HTMLDivElement, tooltip: HTMLDivElement, dataId: string, e: MouseEvent) => {
     
      // console.log(element.style.top, element.style.left, element.style.width)
      const data = objectData.current[dataId]
      
      // if (element.id === currentObject.current?.id) { 
      //   tooltip.classList.remove("show-tooltip")
      //   tooltip.classList.add("hide-tooltip")
      // } else {
      //   element.classList.add("current-object")
      //   tooltip.classList.remove("hide-tooltip")
      //   tooltip.classList.add("show-tooltip")

      // }
      if (onMouseDown.current && element.id === currentObject.current?.id) {
          tooltip.classList.remove("show-tooltip")
          tooltip.classList.add("hide-tooltip")

      } else {
          const elementOffsetX = element.getBoundingClientRect().x - canvasRef.current.getBoundingClientRect().x
          const elementOffsetY = element.getBoundingClientRect().y - canvasRef.current.getBoundingClientRect().y
          const cursorOffsetX = e.clientX - canvasRef.current.getBoundingClientRect().x
          const cursorOffsetY = e.clientY - canvasRef.current.getBoundingClientRect().y

          const differenceX = cursorOffsetX - elementOffsetX
          const differenceY = cursorOffsetY - elementOffsetY

          let tooltipOffsetX: number
          let tooltipOffsetY: number


          if ((elementOffsetX + tooltip.getBoundingClientRect().width + differenceX - 50) > (canvasContainerContentWidth - 250))
            tooltipOffsetX = differenceX - tooltip.getBoundingClientRect().width - 50 
          else
            tooltipOffsetX = differenceX + 50
          
          if ((elementOffsetY + differenceY - 50) < 20)
              tooltipOffsetY = differenceY + 20
          else
              tooltipOffsetY = differenceY - 50

          tooltip.classList.remove("hide-tooltip")
          tooltip.classList.add("show-tooltip")
          tooltip.style.left = `${tooltipOffsetX}px`
          tooltip.style.top = `${tooltipOffsetY}px`
      }
      
      // object-hover is a class added when mouse enters an object area.
      
      element.classList.add('object-hover')
      
      const isConcentrator = data.object?.model_name === 'Concentrator'
      tooltip.innerHTML = `
        <p><strong>Label:</strong> ${data.label} </p>
        <p><strong>Description:</strong> ${data.description}</p>
        ${data.properties.oreGrade ? `<p><strong>Ore Grade:</strong> ${data.properties.oreGrade}</p>`:''}

        ${data.properties.oreQuantity ? `<p><strong>Ore Quantity:</strong> ${data.properties.oreQuantity} ${parseFloat(data.properties.oreQuantity) > 1 ? "tons": "ton"}</p>`:''}
        ${data.properties.maxOreSize ? `<p><strong>Max. Ore Size:</strong> ${data.properties.maxOreSize}mm</p>`:''}

        ${data.properties.gape ? `<p><strong>Gape:</strong> ${data.properties.gape}mm</p>`:''}
        ${data.properties.set ? `<p><strong>Set:</strong> ${data.properties.set}mm</p>`:''}
        ${data.properties.aperture ? `<p><strong>Aperture:</strong> ${data.properties.aperture}mm</p>`:''}
        ${data.properties.crusherType ? `<p><strong>Crusher Type:</strong> ${data.properties.crusherType}</p>`:''}
      `
      if (isConcentrator) {
        const {
          gangue_recoverable,
          valuable_recoverable,
          feed_quantity,
          valuable_in_feed,
          gangue_in_feed,
          valuable_in_product,
          gangue_in_product,
          valuable_in_waste,
          gangue_in_waste
        } = concentratorAnalysis(data)

        const content = `
          <p><strong>Recovery(%) of valuable mineral:</strong> ${valuable_recoverable} </p>
          <p><strong>Recovery(%) of gangue: </strong> ${gangue_recoverable} </p>
          <h3 class='font-semibold'>Ore Recovery</h3>
          <div> 
            <p><strong>Valuable(%) in feed:</strong> ${valuable_in_feed * 100} </p>
            <p><strong>Gangue(%) in feed: </strong> ${gangue_in_feed * 100} </p>
            <h4>Concentrate </h4>
            <p><strong>Valuable Quantity: </strong> ${valuable_in_product.toFixed(2)}</p>
            <p><strong>Gangue Quantity: </strong> ${gangue_in_product.toFixed(2)}</p>
            <h4>Waste </h4>
            <p><strong>Gangue Quantity: </strong> ${gangue_in_waste.toFixed(2)}</p>
            <p><strong>Valuable Quantity: </strong> ${valuable_in_waste.toFixed(2)}</p>
          </div>
        `
        tooltip.innerHTML += content
      }

      
    }, [objectData, canvasRef])



    
    const loadObjectToCanvas = useCallback(() => {
      for (const dataId in objectData.current) {
        const data = objectData.current[dataId]
  
        // console.log("element", element)
        const objectJSX = <ObjectCreator objectData={objectData.current} dataId={dataId}/>
        
        const jsxToHTMLString= renderToStaticMarkup(objectJSX)
        const parser = new DOMParser()
        const temporaryDocument = parser.parseFromString(jsxToHTMLString, "text/html")
        const newEl = temporaryDocument.getElementById(data.object!.id) as HTMLDivElement
        const elementObjectName = data.object!.name
        const elementObjectType = data.object!.model_name

        newEl.setAttribute("tabindex", "-1")
        newEl.removeAttribute("data-object-type")
        newEl.removeAttribute("data-object-name")

        let newElEventMap = elementEventHandlers.current.get(newEl)
        
        if (!newElEventMap) {
          newElEventMap = new Map()
          elementEventHandlers.current.set(newEl, newElEventMap)
          eventElementSet.current.add(newEl)
        }


        if (elementObjectType === "Shape" && elementObjectName === "Text") {
          // newEl.style.zIndex = "5"

          // defaultElementLabel = "Text"
          newEl.setAttribute("data-variant", "text")
          newEl.classList.add("text-z-index")
          const contentEditableDiv = document.createElement("div")
          const textControl = document.createElement("div")

          textControl.innerHTML = `
            <div class="text-size-control"> <span class="selected-size-name">Medium</span>  <img class="open-control-options" src=${arrowDown.src} width="10" height="10"/>
                  <div class="text-size-control-options">
                    <span class="text-size-small" data-size="12">Small</span>
                    <span class="text-size-medium" data-size="14">Medium</span>
                    <span class="text-size-large" data-size="16">Large</span>
                  </div>
            </div>
           
          `
          // For adding text bold, italic and underline Later
          // <div class="panel-split"></div>
          // <div class="text-style-control"> 
          //       <span class="text-bold-control">B</span> 
          //       <span class="text-italic-control">I</span> 
          //       <span class="text-underline-control">U</span>
          // </div>
          
          textControl.classList.add('text-control-panel')
          contentEditableDiv.setAttribute("tabindex", "-1")
          
          newEl.innerHTML = `
            <span class="text-panel text-panel-tl"></span>
            <span class="text-panel text-panel-tr"></span>
            <span class="text-panel text-panel-br"></span>
            <span class="text-panel text-panel-bl"></span>
          `
          newEl.appendChild(contentEditableDiv)

          newEl.appendChild(textControl)
        
        const textControlOptions = textControl.querySelector(".text-size-control-options") as HTMLElement
        const controlOptionButton = textControl.querySelector(".open-control-options") as HTMLImageElement

        if (controlOptionButton) {
          let ctrlOptionBtnMap = elementEventHandlers.current.get(controlOptionButton)
          if (!ctrlOptionBtnMap) {
            ctrlOptionBtnMap = new Map()
            elementEventHandlers.current.set(controlOptionButton, ctrlOptionBtnMap)
            eventElementSet.current.add(controlOptionButton)
          }
          const ctrlOptHandler = controlOptionClickHandler(textControlOptions, controlOptionButton)
          ctrlOptionBtnMap.set("click", ctrlOptHandler)          
          controlOptionButton.addEventListener("click", ctrlOptHandler)
        }
        
        
        textControlOptions?.querySelectorAll("span").forEach((span) => {
          let txtControlSpanMap = elementEventHandlers.current.get(span)
          if (!txtControlSpanMap) {
            txtControlSpanMap = new Map()
            elementEventHandlers.current.set(span, txtControlSpanMap)
            eventElementSet.current.add(span)
          }
          const txtControlSpanHandler = textControlOptionClickHandler(textControlOptions, newEl, span, controlOptionButton)
          txtControlSpanMap.set("click", txtControlSpanHandler)
          span.addEventListener("click", txtControlSpanHandler)
        })


          // contentEditableDiv.setAttribute("data-variant", "text")
          contentEditableDiv.setAttribute("data-placeholder", "Text")
          contentEditableDiv.classList.add("shape-text-base-styles")
          contentEditableDiv.innerHTML = objectData.current[dataId].description
          if (contentEditableDiv.innerHTML!.length === 0)
            contentEditableDiv.classList.add("placeholder-style")


          let textControlMap = elementEventHandlers.current.get(textControl)
          if (!textControlMap) {
            textControlMap = new Map()
            elementEventHandlers.current.set(textControl, textControlMap)
            eventElementSet.current.add(textControl)
          }
          const txtCtrlMouseEnterHandler = textControlMouseEnterHandler(newEl)
          const txtCtrlMouseLeaveHandler = textControlMouseLeaveHandler(newEl)
          textControlMap.set('mouseenter', txtCtrlMouseEnterHandler )
          textControlMap.set('mouseleave', txtCtrlMouseLeaveHandler)


          textControl.addEventListener("mouseenter",  txtCtrlMouseEnterHandler)
          textControl.addEventListener("mouseleave", txtCtrlMouseLeaveHandler)
     

          let contentEditableDivMap = elementEventHandlers.current.get(contentEditableDiv) 
          if (!contentEditableDivMap) {
            contentEditableDivMap = new Map()
            elementEventHandlers.current.set(contentEditableDiv, contentEditableDivMap)
            eventElementSet.current.add(contentEditableDiv)
          }
          const contEditableDblClickHandler = (e: MouseEvent) => handleDblClick(e, contentEditableDiv) 
          contentEditableDivMap.set("dblclick", contEditableDblClickHandler)
          contentEditableDiv.addEventListener("dblclick", contEditableDblClickHandler)

          const contEditableFocusOutHandler = () => textFocusOut(newEl as HTMLDivElement, contentEditableDiv)
          
          contentEditableDivMap.set("focusout", contEditableFocusOutHandler)
          contentEditableDivMap.set("keyup", handleInput)

          const newElTextFocusOutHandler = () => textFocusOut(newEl as HTMLDivElement, contentEditableDiv)
          newElEventMap.set("focusout", newElTextFocusOutHandler)
          contentEditableDiv.addEventListener("focusout", contEditableFocusOutHandler)
          newEl.addEventListener("focusout", newElTextFocusOutHandler)
          contentEditableDiv.addEventListener("keyup", handleInput)

        } else if (elementObjectType === "Shape" && elementObjectName === "Line") {
          // Lines 
          // newEl.style.zIndex = "5"
      
          newEl.setAttribute("data-variant", "line")
          newEl.classList.add("line-z-index")
          newEl.style.outline = "none"

          const lineFocusEventHandler = (e: FocusEvent)=> showPointVisibility(e, newEl)
          const lineFocusOutEventHandler = (e: FocusEvent)=> hidePointVisibility(e, newEl)
          const lineKeyEventHandler = (e: KeyboardEvent)=>handleShapeDelete(e, newEl)
          newElEventMap.set("focus", lineFocusEventHandler)
          newElEventMap.set("blur", lineFocusOutEventHandler)
          newElEventMap.set("keyup", lineKeyEventHandler)

          newEl.addEventListener("focus", lineFocusEventHandler)
          newEl.addEventListener("blur", lineFocusOutEventHandler)
          newEl.addEventListener("keyup", lineKeyEventHandler)
          
          
          const lineWrapEl = newEl.querySelector(".line-wrap") as HTMLDivElement
          const svg = newEl.querySelector("svg.line-svg")!

          const path = svg.querySelector("path")
          const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          arrow.setAttribute("height", "20")
          arrow.setAttribute("width", "20")
          arrow.setAttribute("xmlns", "http://www.w3.org/2000/svg")
          arrow.classList.add("arrow-indicator")


          if (data.properties.nextObject.length > 0 && data.properties.prevObject.length > 0) {
            arrow.innerHTML = `
              <polygon points="${lineCapCoordinate}" fill="#4D4D4D" stroke="transparent" strokeWidth="1.5" />
            `
            path!.setAttribute("stroke", "#4D4D4D")
          }
           
          else {
            arrow.innerHTML = `
              <polygon points="${lineCapCoordinate}" fill="#beb4b4" stroke="transparent" strokeWidth="1.5" />
            `
            path!.setAttribute("stroke", "#beb4b4")
          }
          
          if (path) {
            let pathEventMap = elementEventHandlers.current.get(path)

            if (!pathEventMap) {
              pathEventMap = new Map()
              elementEventHandlers.current.set(path, pathEventMap)
              eventElementSet.current.add(path)
            }

            const pathDblClickHandler = (e: MouseEvent) => showPointVisibility(e, newEl)
            pathEventMap.set("dblclick", pathDblClickHandler)
      
            path.addEventListener("dblclick", pathDblClickHandler)
          }
       
          // path!.addEventListener("mouseover", (e)=> console.log("hover"))
          const pointAnchorUid = "point-"+uuidv4()
          // const point2Uid = 


          // M: [number, number], 
          // L: [number, number][]
          const pointAnchor = document.createElement("span") // For the M coordinate point
          pointAnchor.classList.add("point-indicators")
          pointAnchor.classList.add("hide-indicator")
          pointAnchor.setAttribute("id", pointAnchorUid)
          pointStore.current[pointAnchorUid] = [{prev: null, next: null}, ["M"]]
          pointAnchor.style.top = `${data.properties.coordinates.lineCoordinates!.M[1]}px`
          pointAnchor.style.left = `${data.properties.coordinates.lineCoordinates!.M[0]}px`
          lineWrapEl.appendChild(pointAnchor)
          const movablePoints = data.properties.coordinates.lineCoordinates!.L
          let prevPointUid = pointAnchorUid;


          for (let pointIndex = 0; pointIndex < movablePoints.length; pointIndex++) {
            const newPoint = document.createElement("span")
            const newPointUid = "point-"+uuidv4()
            newPoint.classList.add("point-indicators")
            newPoint.classList.add("hide-indicator")
            newPoint.setAttribute("id", newPointUid)
            let newPointEventMap = elementEventHandlers.current.get(newPoint)
            if (!newPointEventMap) {
              newPointEventMap = new Map()
              elementEventHandlers.current.set(newPoint, newPointEventMap)
              eventElementSet.current.add(newPoint)
            }
            const ptMouseDownHandler = pointMouseDownHandler(newPoint)
            const ptMouseUpHandler = pointMouseUpHandler(newPoint)
            const ptDblClickHandler = pointDblClickHandler(newPoint)

            newPointEventMap.set("mousedown", ptMouseDownHandler)
            newPointEventMap.set("mouseup", ptMouseUpHandler)
            newPointEventMap.set("dblclick", ptDblClickHandler)

            newPoint.addEventListener("mousedown", ptMouseDownHandler) 
            newPoint.addEventListener("mouseup", ptMouseUpHandler)
            newPoint.addEventListener("dblclick", ptDblClickHandler)

            if (pointIndex === movablePoints.length - 1)
              pointStore.current[newPointUid] = [{prev: prevPointUid, next: null}, ["L", pointIndex]]
            else
              pointStore.current[newPointUid] = [{prev: prevPointUid, next: null}, ["L", pointIndex, pointIndex + 1]]

            // update the prevPointUid next property to point to the new point (newPointUid)
            pointStore.current[prevPointUid][0].next = newPointUid
            newPoint.style.left = `${movablePoints[pointIndex][0]}px`
            newPoint.style.top = `${movablePoints[pointIndex][1]}px`
            lineWrapEl.appendChild(newPoint)
            prevPointUid = newPointUid

          }

          const objectDetails = data.properties.coordinates
         
          const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
          path?.setAttribute("d", coordString)

          let x1: number, y1: number, x2: number, y2: number;
          const pointID = pointStore.current[prevPointUid]
          const pointDetails = pointID[1]
          const prevPointDetails = pointStore.current[pointID[0].prev as string][1]

          if (prevPointDetails[0] === "M") {
            [x1, y1] = objectDetails.lineCoordinates![prevPointDetails[0]] as [number, number]
          } else {
            [x1, y1] = objectDetails.lineCoordinates![prevPointDetails[0]][prevPointDetails[1]!] as [number, number]
          }
          [x2, y2] = objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] as [number, number]
          arrow.style.top = `${y2}px`
          arrow.style.left = `${x2}px`
          
          
          const theta = getTheta(x1, x2, y1, y2)

          arrow.style.transform = `translate(-50%, -100%) rotate(${theta}deg)`
          lineWrapEl.appendChild(arrow)

          
        }else {
          newEl.insertAdjacentHTML(
            'beforeend',`
            <span class="resize-panel resize-panel-tl"></span>
            <span class="resize-panel resize-panel-tr"></span>
            <span class="resize-panel resize-panel-br"></span>
            <span class="resize-panel resize-panel-bl"></span>
          `
          )
          // remove all flex classes
          // flex-1 flex items-center justify-center
          newEl.classList.remove("flex")
          newEl.classList.remove("flex-1")
          newEl.classList.remove("items-center")
          newEl.classList.remove("justify-center")

        

          const resizePanels = newEl.querySelectorAll(".resize-panel");
          resizePanels.forEach((panel) => {
            let panelEventMap = elementEventHandlers.current.get(panel)
            if (!panelEventMap) {
              panelEventMap = new Map()
              elementEventHandlers.current.set(panel, panelEventMap)
              eventElementSet.current.add(panel)
            }
            const panelMouseDownEventHandler =  panelMouseDownHandler(panel as HTMLSpanElement)
            panelEventMap.set("mousedown", panelMouseDownEventHandler);

            (panel as HTMLSpanElement).addEventListener('mousedown', panelMouseDownEventHandler)
      

          })

          const cmpFocusHandler = componentFocusHandler(resizePanels, newEl)
          const cmpFocusOutHandler = componentFocusOutHandler(resizePanels, newEl)
          const cmpShapeDelete = (e: KeyboardEvent)=>handleShapeDelete(e, newEl)

          newElEventMap.set("focus", cmpFocusHandler)
          newElEventMap.set("blur", cmpFocusOutHandler)
          newElEventMap.set("keyup", cmpShapeDelete)
         
          newEl.addEventListener("focus", cmpFocusHandler)
          newEl.addEventListener("blur", cmpFocusOutHandler)
          newEl.addEventListener("keyup", cmpShapeDelete)
        }



        newEl.setAttribute("id", dataId)
        newEl.removeAttribute("draggable")
        newEl.classList.add("absolute")
        newEl.classList.add("cursor-move")
        newEl.classList.remove("cursor-grabbing")

        const x = data.properties.coordinates.lastX
        const y = data.properties.coordinates.lastY
        newEl.style.top = `${y}px`
        newEl.style.left = `${x}px`
        
    
        if (typeof data.scale === 'number') {
            data.scale = {x: data.scale, y: data.scale}
        }

        
        if (elementObjectName !== "Line") {
          
          let scaledWidth = data.scale.x
          let scaledHeight = data.scale.y
          

          if (elementObjectType === "Shape" && elementObjectName !== "Text") {
            const svg = newEl.querySelector("svg")!
            if (!data.properties.width)
              data.properties.width = Number(svg.getAttribute("width"))
            if (!data.properties.height)
              data.properties.height = Number(svg.getAttribute("height"))
          
            scaledWidth *= data.properties.width
            scaledHeight *= data.properties.height

            svg.style.width = `${scaledWidth}px`
            svg.style.height = `${scaledHeight}px`
          } else if (elementObjectName === "Text") {
            newEl.style.transform = `scaleX(${data.scale.x}) scaleY(${data.scale.y})`

          } else {
            const image = newEl.querySelector("img")!
            if (!data.properties.width)
              data.properties.width = Number(image.getAttribute("width"))
            if (!data.properties.height)
              data.properties.height = Number(image.getAttribute("height"))
            scaledWidth *= data.properties.width
            scaledHeight *= data.properties.height 
            
            image.style.width = `${scaledWidth}px`
            image.style.height = `${scaledHeight}px`
          }
        } 

        const cmpMouseDownEventHandler = componentMouseDownHandler(newEl)
        const cmpMouseUpEventHandler = componentMouseUpHandler(newEl)
        newElEventMap.set("mousedown", cmpMouseDownEventHandler)
        newElEventMap.set("mouseup", cmpMouseUpEventHandler)
        newEl.addEventListener("mousedown", cmpMouseDownEventHandler);
        newEl.addEventListener("mouseup", cmpMouseUpEventHandler);


        canvasRef.current.appendChild(newEl)
        objectLabels.current.add(data.label)
        if (data.properties.crusherType === "primary")
          primaryCrusherInUse.current = true

        if (elementObjectName !== "Text") {
          const tooltipWrapper = document.createElement("div")
          tooltipWrapper.classList.add('object-details-tooltip')
          tooltipWrapper.classList.add("hide-tooltip")
          newEl.appendChild(tooltipWrapper)

          const cmpMouseEnterEventHandler = (e: MouseEvent)=> showObjectDetailsToolTip(newEl, tooltipWrapper, dataId, e)
          const cmpMouseLeaveEventHandler = componentMouseLeaveHandler(newEl, tooltipWrapper)

          newElEventMap.set("mouseenter", cmpMouseEnterEventHandler)
          newElEventMap.set("mouseleave", cmpMouseLeaveEventHandler)


          newEl.addEventListener("mouseenter", cmpMouseEnterEventHandler)
          newEl.addEventListener("mouseleave", cmpMouseLeaveEventHandler)
          
        } else {
          // Set font size and focus the active element on the right font size option
          newEl.style.fontSize = `${data.font_size}px`
          const textControlPanel = newEl.querySelector(".text-control-panel")!
          textControlPanel.querySelector(".selected-size-name")!.textContent = data.font_size === 12 ? "Small" : data.font_size === 14 ? "Medium" : "Large"
          textControlPanel.querySelector(`[data-size="${data.font_size}"]`)?.classList.add("text-selected")
        }
        
      }
      areListenersAttached.current = true
    }, [handleInput, handleShapeDelete, objectData, showObjectDetailsToolTip, canvasRef, textFocusOut, textControlMouseEnterHandler, textControlMouseLeaveHandler, textControlOptionClickHandler])



    const handleDrop = (e: DragEvent<HTMLDivElement>) => {

      let defaultCoords: objectCoords = {
        startX: 0, 
        startY: 0, 
        lastX: 0, 
        lastY: 0,
        
      }
      let defaultElementLabel = ""
      let auxilliaryType = null;
      const elementId = e.dataTransfer?.getData("elementId");
      if (!elementId) return
      const element = document.getElementById(elementId as string)
      if (!element) return
      currentObject.current?.classList.remove('current-object')
      const elementObjectType = element.getAttribute("data-object-type")! as objectType // Shape, Grinder, Crusher
      const elementObjectName = element.getAttribute("data-object-name") || null //Circle, Text etc...
      /**
       * 
       * initial width
       */
      const initialWidth = element.getBoundingClientRect().width
      const initialHeight = element.getBoundingClientRect().height
      


      const newEl = element.cloneNode(true) as HTMLElement
      const canvasX = canvasRef.current.getBoundingClientRect().x
      const canvasY = canvasRef.current.getBoundingClientRect().y
      newEl.setAttribute("tabindex", "-1")
      newEl.removeAttribute("data-object-type")
      newEl.removeAttribute("data-object-name")
      if (elementObjectType === "Auxilliary") {
        auxilliaryType = element.getAttribute("data-object-type-variant")
        newEl.removeAttribute("data-object-type-variant")
      }


       let newElEventMap = elementEventHandlers.current.get(newEl)
        
      if (!newElEventMap) {
        newElEventMap = new Map()
        elementEventHandlers.current.set(newEl, newElEventMap)
        eventElementSet.current.add(newEl)
      }
      // console.log(newEl, "new el")
      // 
      // newEl.style.outline = "1px solid red"
      let x = e.clientX - canvasX - 30
      let y = e.clientY - canvasY - 30



      // Text
      if (elementObjectType === "Shape" && elementObjectName === "Text") {
        // newEl.style.zIndex = "5"

        newEl.setAttribute("data-variant", "text")
        newEl.classList.add("text-z-index")
        defaultElementLabel = "Text"
        
        const contentEditableDiv = document.createElement("div")
        const textControl = document.createElement("div")

        textControl.innerHTML = `
          <div class="text-size-control"> <span class="selected-size-name">Medium</span>  <img class="open-control-options" src=${arrowDown.src} width="10" height="10"/>
                <div class="text-size-control-options">
                  <span class="text-size-small" data-size="12">Small</span>
                  <span class="text-size-medium text-selected" data-size="14">Medium</span>
                  <span class="text-size-large" data-size="16">Large</span>
                </div>
          </div>
         
        `
        // For adding text bold, italic and underline Later
        // <div class="panel-split"></div>
        // <div class="text-style-control"> 
        //       <span class="text-bold-control">B</span> 
        //       <span class="text-italic-control">I</span> 
        //       <span class="text-underline-control">U</span>
        // </div>
        textControl.classList.add('text-control-panel')
        contentEditableDiv.setAttribute("tabindex", "-1")
       
        newEl.innerHTML = `
          <span class="text-panel text-panel-tl"></span>
          <span class="text-panel text-panel-tr"></span>
          <span class="text-panel text-panel-br"></span>
          <span class="text-panel text-panel-bl"></span>
        `
        newEl.appendChild(contentEditableDiv)


        
        newEl.appendChild(textControl)
        
        const textControlOptions = textControl.querySelector(".text-size-control-options") as HTMLElement
        const controlOptionButton = textControl.querySelector(".open-control-options") as HTMLImageElement


        if (controlOptionButton) {
          let ctrlOptionBtnMap = elementEventHandlers.current.get(controlOptionButton)
          if (!ctrlOptionBtnMap) {
            ctrlOptionBtnMap = new Map()
            elementEventHandlers.current.set(controlOptionButton, ctrlOptionBtnMap)
            eventElementSet.current.add(controlOptionButton)
          }
          const ctrlOptHandler = controlOptionClickHandler(textControlOptions, controlOptionButton)
          ctrlOptionBtnMap.set("click", ctrlOptHandler)          
          controlOptionButton.addEventListener("click", ctrlOptHandler)
        }

       
        textControlOptions?.querySelectorAll("span").forEach((span) => {
          let txtControlSpanMap = elementEventHandlers.current.get(span)
          if (!txtControlSpanMap) {
            txtControlSpanMap = new Map()
            elementEventHandlers.current.set(span, txtControlSpanMap)
            eventElementSet.current.add(span)
          }
          const txtControlSpanHandler = textControlOptionClickHandler(textControlOptions, newEl, span, controlOptionButton)
          txtControlSpanMap.set("click", txtControlSpanHandler)
          span.addEventListener("click", txtControlSpanHandler)
        })



        
        // contentEditableDiv.setAttribute("data-variant", "text")
        contentEditableDiv.setAttribute("data-placeholder", "Text")
        contentEditableDiv.classList.add("placeholder-style")
        contentEditableDiv.classList.add("shape-text-base-styles")

        let textControlMap = elementEventHandlers.current.get(textControl)
        if (!textControlMap) {
          textControlMap = new Map()
          elementEventHandlers.current.set(textControl, textControlMap)
          eventElementSet.current.add(textControl)
        }
        const txtCtrlMouseEnterHandler = textControlMouseEnterHandler(newEl)
        const txtCtrlMouseLeaveHandler = textControlMouseLeaveHandler(newEl)
        textControlMap.set('mouseenter', txtCtrlMouseEnterHandler )
        textControlMap.set('mouseleave', txtCtrlMouseLeaveHandler)


        textControl.addEventListener("mouseenter",  txtCtrlMouseEnterHandler)
        textControl.addEventListener("mouseleave", txtCtrlMouseLeaveHandler)
     

        let contentEditableDivMap = elementEventHandlers.current.get(contentEditableDiv) 
        if (!contentEditableDivMap) {
          contentEditableDivMap = new Map()
          elementEventHandlers.current.set(contentEditableDiv, contentEditableDivMap)
          eventElementSet.current.add(contentEditableDiv)
        }
        const contEditableDblClickHandler = (e: MouseEvent) => handleDblClick(e, contentEditableDiv) 
        contentEditableDivMap.set("dblclick", contEditableDblClickHandler)
        contentEditableDiv.addEventListener("dblclick", contEditableDblClickHandler)


        const contEditableFocusOutHandler = () => textFocusOut(newEl as HTMLDivElement, contentEditableDiv)
          
        contentEditableDivMap.set("focusout", contEditableFocusOutHandler)
        contentEditableDivMap.set("keyup", handleInput)

        const newElTextFocusOutHandler = () => textFocusOut(newEl as HTMLDivElement, contentEditableDiv)
        newElEventMap.set("focusout", newElTextFocusOutHandler)
        contentEditableDiv.addEventListener("focusout", contEditableFocusOutHandler)
        newEl.addEventListener("focusout", newElTextFocusOutHandler)
        contentEditableDiv.addEventListener("keyup", handleInput)


      } else if (elementObjectType === "Shape" && elementObjectName === "Line") {
        // Lines 
        // newEl.style.zIndex = "5"
        newEl.setAttribute("data-variant", "line")
        newEl.classList.add("line-z-index")
        newEl.style.outline = "none"
      
        const lineFocusEventHandler = (e: FocusEvent)=> showPointVisibility(e, newEl)
        const lineFocusOutEventHandler = (e: FocusEvent)=> hidePointVisibility(e, newEl)
        const lineKeyEventHandler = (e: KeyboardEvent)=>handleShapeDelete(e, newEl)
        newElEventMap.set("focus", lineFocusEventHandler)
        newElEventMap.set("blur", lineFocusOutEventHandler)
        newElEventMap.set("keyup", lineKeyEventHandler)

        newEl.addEventListener("focus", lineFocusEventHandler)
        newEl.addEventListener("blur", lineFocusOutEventHandler)
        newEl.addEventListener("keyup", lineKeyEventHandler)
        

        const lineWrapEl = newEl.querySelector(".line-wrap") as HTMLDivElement
        lineWrapEl.innerHTML = ""
        const lineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lineSvg.classList.add("overflow-visible")
        lineSvg.classList.add("line-svg")
        lineSvg.setAttribute("width", "20")
        lineSvg.setAttribute("height", "20")
        lineSvg.innerHTML = `
          <path d="M10 10 L20 10" fill="none" stroke="#beb4b4" strokeWidth="1.5"/>
        `
        lineWrapEl.appendChild(lineSvg)
        const path = lineSvg.querySelector("path")
        
        
        if (path) {
          let pathEventMap = elementEventHandlers.current.get(path)

          if (!pathEventMap) {
            pathEventMap = new Map()
            elementEventHandlers.current.set(path, pathEventMap)
            eventElementSet.current.add(path)
          }

          const pathDblClickHandler = (e: MouseEvent) => showPointVisibility(e, newEl)
          pathEventMap.set("dblclick", pathDblClickHandler)
    
          path.addEventListener("dblclick", pathDblClickHandler)
        }

        // path!.addEventListener("mouseover", (e)=> console.log("hover"))
        const point1Uid = "point-"+uuidv4()
        const point2Uid = "point-"+uuidv4()

        const point1 = document.createElement("span") // Starting point which doesn't change
        const point2 = document.createElement("span")
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        
        arrow.setAttribute("height", "20")
        arrow.setAttribute("width", "20")
        arrow.setAttribute("xmlns", "http://www.w3.org/2000/svg")
        arrow.classList.add("arrow-indicator")
        point1.classList.add("point-indicators")
        point2.classList.add("point-indicators")
        point1.classList.add("hide-indicator")
        point2.classList.add("hide-indicator")
        point1.setAttribute("id", point1Uid)
        point2.setAttribute("id", point2Uid)
        let point2EventMap = elementEventHandlers.current.get(point2)
        if (!point2EventMap) {
          point2EventMap = new Map()
          elementEventHandlers.current.set(point2, point2EventMap)
          eventElementSet.current.add(point2)
        }
        const ptMouseDownHandler = pointMouseDownHandler(point2)
        const ptMouseUpHandler = pointMouseUpHandler(point2)
        const ptDblClickHandler = pointDblClickHandler(point2)

        point2EventMap.set("mousedown", ptMouseDownHandler)
        point2EventMap.set("mouseup", ptMouseUpHandler)
        point2EventMap.set("dblclick", ptDblClickHandler)

        point2.addEventListener("mousedown", ptMouseDownHandler) 
        point2.addEventListener("mouseup", ptMouseUpHandler)
        point2.addEventListener("dblclick", ptDblClickHandler)
        const startCoords: [number, number] = [10, 10]
        point1.style.top = `${startCoords[1]}px`
        point1.style.left = `${startCoords[0]}px`
        point2.style.left = `60px`
        point2.style.top = `${startCoords[1]}px`
        arrow.style.top = `${startCoords[1]}px`;
        arrow.style.left = `60px`
        
        arrow.innerHTML = `
          <polygon points="${lineCapCoordinate}" fill="#beb4b4" stroke="transparent" strokeWidth="1.5" />
        `
        lineWrapEl.appendChild(point1)
        lineWrapEl.appendChild(point2)
     
        // arrow section
        const y1: number = 15
        const y2: number = 15
        const x1 = 0
        const x2 = 50
        const theta = getTheta(x1, x2, y1, y2)
        arrow.style.transform = `translate(-50%, -100%) rotate(${theta}deg)`
        lineWrapEl.appendChild(arrow)
        


        const lineCoordinates: lineCordsType  = {"M": startCoords, "L": [[50, 10]]}
        defaultCoords["lineCoordinates"] = lineCoordinates
        const coordString = LineCoordinateToPathString(lineCoordinates)
        path?.setAttribute("d", coordString)
        pointStore.current[point1Uid] = [{prev: null, next: point2Uid}, ["M"]]
        pointStore.current[point2Uid] = [{prev: point1Uid, next: null}, ["L", 0]]
        
      }else {

          // remove all flex classes
          // flex-1 flex items-center justify-center
          newEl.classList.remove("flex")
          newEl.classList.remove("flex-1")
          newEl.classList.remove("items-center")
          newEl.classList.remove("justify-center")

          newEl.insertAdjacentHTML(
            'beforeend',`
            <span class="resize-panel resize-panel-tl"></span>
            <span class="resize-panel resize-panel-tr"></span>
            <span class="resize-panel resize-panel-br"></span>
            <span class="resize-panel resize-panel-bl"></span>
          `
          )
          const resizePanels = newEl.querySelectorAll(".resize-panel");
          resizePanels.forEach((panel) => {
            let panelEventMap = elementEventHandlers.current.get(panel)
            if (!panelEventMap) {
              panelEventMap = new Map()
              elementEventHandlers.current.set(panel, panelEventMap)
              eventElementSet.current.add(panel)
            }
            const panelMouseDownEventHandler =  panelMouseDownHandler(panel as HTMLSpanElement)
            panelEventMap.set("mousedown", panelMouseDownEventHandler);

            (panel as HTMLSpanElement).addEventListener('mousedown', panelMouseDownEventHandler)

        
          })
          
          
          const cmpFocusHandler = componentFocusHandler(resizePanels, newEl)
          const cmpFocusOutHandler = componentFocusOutHandler(resizePanels, newEl)
          const cmpShapeDelete = (e: KeyboardEvent)=>handleShapeDelete(e, newEl)

          newElEventMap.set("focus", cmpFocusHandler)
          newElEventMap.set("blur", cmpFocusOutHandler)
          newElEventMap.set("keyup", cmpShapeDelete)
         
          newEl.addEventListener("focus", cmpFocusHandler)
          newEl.addEventListener("blur", cmpFocusOutHandler)
          newEl.addEventListener("keyup", cmpShapeDelete)
      }

      
      const uuid4 = uuidv4()
      // newEl.style.border = "1px solid red"

      const defaultObjectData = {
          oid: uuid4,
          label: defaultElementLabel,
          x_coordinate: 0,
          y_coordinate: 0,
          scale: {x: 1.25, y: 1.25},
          font_size: 14,
          description: "",
          object_info: {
            object_model_name: elementObjectType,
            object_id: elementId
          },
          properties: {
            width: initialWidth,
            height: initialHeight,
            nextObject: [],
            prevObject: [],
            coordinates: defaultCoords
          }
      }
      newEl.setAttribute("id", uuid4)
      newEl.removeAttribute("draggable")
      newEl.classList.add("absolute")
      newEl.classList.add("cursor-move")
      newEl.classList.remove("cursor-grabbing")

      //. Ensure when the object is dropped it's within the canvas area
      x = x < 6 ? 6 : x + 100 > canvasContainerContentWidth ? canvasContainerContentWidth - 100 : parseFloat(x.toFixed(6))
      y = y < 6 ? 6 : y + 100 > canvasContainerContentHeight ? canvasContainerContentHeight - 100 : parseFloat(y.toFixed(6))
     
      objectData.current[uuid4] = defaultObjectData
      objectData.current[uuid4].properties.coordinates.lastX = x
      objectData.current[uuid4].properties.coordinates.lastY = y
      objectData.current[uuid4].x_coordinate = x
      objectData.current[uuid4].y_coordinate = y
      newEl.style.top = `${y}px`
      newEl.style.left = `${x}px`
      
      if (elementObjectName !== "Line") {
        if (elementObjectType === "Shape" && elementObjectName !== "Text") {
          const svg = newEl.querySelector("svg")!
          svg.style.width = `${initialWidth * 1.25}px`
          svg.style.height = `${initialHeight * 1.25}px`
        } else if (elementObjectName === "Text") {
          newEl.style.transform = `scale(1.25)`
        } else {
          const image = newEl.querySelector("img")!
          image.style.width = `${initialWidth * 1.25}px`
          image.style.height = `${initialHeight * 1.25}px`
        }
      } 
      LineConnector(newEl)
    
      const cmpMouseDownEventHandler = componentMouseDownHandler(newEl)
      const cmpMouseUpEventHandler = componentMouseUpHandler(newEl)

      newElEventMap.set("mousedown", cmpMouseDownEventHandler)
      newElEventMap.set("mouseup", cmpMouseUpEventHandler)

      newEl.addEventListener("mousedown", cmpMouseDownEventHandler);
      newEl.addEventListener("mouseup", cmpMouseUpEventHandler);

      canvasRef.current.appendChild(newEl)

      if (elementObjectName !== "Text") {
        showObjectForm(x, y, elementObjectType, auxilliaryType)
        const tooltipWrapper = document.createElement("div")
        tooltipWrapper.classList.add('object-details-tooltip')
        tooltipWrapper.classList.add("hide-tooltip")
        newEl.appendChild(tooltipWrapper)      
        
        const cmpMouseEnterEventHandler = (e: MouseEvent)=> showObjectDetailsToolTip(newEl as HTMLDivElement, tooltipWrapper, uuid4, e)
        const cmpMouseLeaveEventHandler = componentMouseLeaveHandler(newEl, tooltipWrapper)

        newElEventMap.set("mouseenter", cmpMouseEnterEventHandler)
        newElEventMap.set("mouseleave", cmpMouseLeaveEventHandler)


        newEl.addEventListener("mouseenter", cmpMouseEnterEventHandler)
        newEl.addEventListener("mouseleave", cmpMouseLeaveEventHandler)
      } else {
          newEl.style.fontSize = `${defaultObjectData.font_size}px`
          setIsEdited(true)
      }
      prevActiveObject.current = currentObject.current
      currentObject.current = newEl
      

    }


    const onPanelMouseDown = useCallback((e: MouseEvent | null, panel: HTMLSpanElement | null) => {
        if (!e || !panel) return
        // console.log(e, 'mousedown')
        panelMouseStart.current = {x: e.clientX, y: e.clientY}
        
        panelObjectOffsetStart.current = {x: currentObject.current.offsetLeft, y: currentObject.current.offsetTop}
        onPanelResize.current = true;
        currentPanel.current = panel

        eventTracker.current.panelMouseDownEventInvoked = {status: false, event: null, element: null}
    }, [])


    const handleMouseMove = useCallback((e: MouseEvent | null) => {
        // console.log(e.clientY - CanvasContainer.offsetTop)
        if (!e) return
        if (onPanelResize.current) {
          let MAXSCALE, MINSCALE
          MAXSCALE = 2.5
          MINSCALE = 0.8
          const panel = currentPanel.current
          const obj = currentObject.current
          const objData = objectData.current[obj.id]
          const scale = objData.scale as {x: number, y: number}
          let newOffsetLeft = null
          let newOffsetTop = null
          // let scaleOut = true;
          // console.log("objdata", objData)
          
          

          // const objectOffsetX = obj.offsetLeft
          // const objectOffsetY = obj.offsetTop
          // const objectOffsetYBottom = obj.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
          // const objectOffsetXRight = obj.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
          // const cursorX = e.clientX - canvasRef.current.getBoundingClientRect().x
          // const cursorY = e.clientY - canvasRef.current.getBoundingClientRect().y


          // console.log("cursor X", cursorX, panelCoordinateXMarker.current)
          // console.log("cursor Y", cursorY, panelCoordinateYMarker.current)
          // if (panelCoordinateXMarker.current === null || panelCoordinateYMarker.current === null){
          //   panelCoordinateXMarker.current = cursorX
          //   panelCoordinateYMarker.current = cursorY
          //   return
          // }


          const xDiff = e.clientX - panelMouseStart.current.x
          const yDiff = e.clientY - panelMouseStart.current.y 
          const scaledWidth =  objData.properties.width * scale.x
          const scaledHeight =  objData.properties.height * scale.y
          let newScaledWidth = scaledWidth + xDiff
          let newScaledHeight = scaledHeight + yDiff
          let newScaleX = newScaledWidth / objData.properties.width 
          let newScaleY = newScaledHeight / objData.properties.height 
          let elementObject = null
          // console.log("new scales", newScaleX, newScaleY)
          // console.log("e clieent x", e.clientX)
          // console.log("panelMouseX", panelMouseStart.current.x)

          const image = obj.querySelector('img')!
          const svg = obj.querySelector('svg')

          if (image) {
            elementObject = image 
          }
          else if (svg) {
             elementObject = svg
             MAXSCALE = 6
          } else return 

          



          // console.log("current scale", currentScale)
          if (panel.classList.contains('resize-panel-bl') || panel.classList.contains('resize-panel-tl')) {
            newOffsetLeft = panelObjectOffsetStart.current.x + xDiff
            newScaledWidth = scaledWidth - xDiff
            newScaleX = newScaledWidth / objData.properties.width 
          }
          // else if (panel.classList.contains('resize-panel-br')) {

          // }
          if (panel.classList.contains('resize-panel-tl') || panel.classList.contains('resize-panel-tr')){
            newOffsetTop = panelObjectOffsetStart.current.y + yDiff
            newScaledHeight = scaledHeight - yDiff
            newScaleY = newScaledHeight / objData.properties.height

          }
          // else if (panel.classList.contains('resize-panel-tr')) {
      
          // }
          
          if (newScaleX > MAXSCALE) {
            newScaleX = MAXSCALE
            newScaledWidth = MAXSCALE * objData.properties.width
            newOffsetLeft = null
          } else if (newScaleX < MINSCALE) {
            newScaleX = MINSCALE
            newScaledWidth = MINSCALE * objData.properties.width
            newOffsetLeft = null
          }

          if (newScaleY > MAXSCALE) {
            newScaleY = MAXSCALE 
            newScaledHeight = MAXSCALE * objData.properties.height
            newOffsetTop = null
          } else if (newScaleY < MINSCALE) {
            newScaleY = MINSCALE 
            newScaledHeight = MINSCALE * objData.properties.height
            newOffsetTop = null
          }


          
          elementObject.style.width = `${newScaledWidth}px`
          elementObject.style.height = `${newScaledHeight}px`
        
          panelResizeScaleMarker.current = {x: newScaleX, y: newScaleY}
          mouseMoved.current = true

          if (newOffsetLeft){
            if (newOffsetLeft < 10) newOffsetLeft = 10
            obj.style.left = `${newOffsetLeft}px`
          }
          if (newOffsetTop) {
            if (newOffsetTop < 10) newOffsetTop = 10
            obj.style.top = `${newOffsetTop}px`
          }
          return;
        }

        if (onMouseDown.current) {
        
          mouseMoved.current = true
          if (currentActivePoint.current !== null) {
            DrawPoint(e, currentActivePoint.current)
          } else {
            const obj = currentObject.current as HTMLElement
            const objScale = objectData.current[obj.id].scale as {x: number, y: number}

            let offsetX = 10 
            let offsetY = 10 
            let offsetRight = canvasContainerContentWidth - 70
            let offsetBottom = canvasContainerContentHeight - 70
            // console.log(e.clientX, "client x")
            // CanvasContainer.scrollLeft += 50
            
            if (obj.getAttribute("data-variant") === "line") {
              // To prevent Lines from going over the edge
              const {offsetLeft, offsetTop, offsetLeftEnd,offsetTopEnd} = checkLineBoundary(e, obj)
            
              offsetX = offsetLeft > offsetX ? offsetLeft : offsetX
              offsetY = offsetTop > offsetY ? offsetTop : offsetY
              offsetRight = offsetLeftEnd < offsetRight && offsetLeftEnd !== 0 ? offsetLeftEnd : offsetRight
              offsetBottom = offsetTopEnd < offsetBottom && offsetTopEnd !== 0 ? offsetTopEnd : offsetBottom
              // console.log("final offset right", offsetRight)
              
            } else {
              const shapeWidth = obj.getBoundingClientRect().width
              const shapeHeight = obj.getBoundingClientRect().height
              const extrasX = shapeWidth - (shapeWidth / objScale.x) // in the case of scaled object we need to know how much they scaled by so we can subtract the excess while positioning our lines
              const extrasY = shapeHeight - (shapeHeight / objScale.y)
           
              offsetRight = canvasContainerContentWidth - (shapeWidth + extrasX / 4)
              offsetBottom = canvasContainerContentHeight - (shapeHeight + extrasY / 4)

            }
            const objectCoordinate = objectData.current[obj.id].properties.coordinates
            let nextX = e.clientX - objectCoordinate.startX + objectCoordinate.lastX
            let nextY = e.clientY - objectCoordinate.startY + objectCoordinate.lastY
            // console.log(nextX, "nextX")
            // console.log(offsetX, "offsetX")

            // console.log("offsetX", offsetX)
            // console.log("offsetY", offsetY)
          
            // console.log(nextX, canvasContainerContentWidth, "canvasContainerContentWidth")
            nextX = nextX < offsetX ? parseFloat(offsetX.toFixed(6)) : nextX > offsetRight ? parseFloat(offsetRight.toFixed(6)) : parseFloat(nextX.toFixed(6))
            nextY = nextY < offsetY ? parseFloat(offsetY.toFixed(6)) : nextY > offsetBottom ? parseFloat(offsetBottom.toFixed(6)): parseFloat(nextY.toFixed(6))
    

            obj.style.top = `${nextY}px`
            obj.style.left = `${nextX}px`
            
            // const containerBounds = CanvasParentContainer.getBoundingClientRect()
            // const currentElementBounds = obj.getBoundingClientRect()
            // const containerCenter = containerBounds.left + (containerBounds.width / 2)
            // const currentElementCenter = currentElementBounds.left + (currentElementBounds.width / 2)

            // if (currentElementBounds.right > containerBounds.right || currentElementBounds.left < containerBounds.left) {
            //   CanvasParentContainer.scrollLeft += (currentElementCenter + containerCenter)
            // }

            // Enable scrolling while dragging of the window to the right and bottom

            // const parentContainerRight = CanvasParentContainer.current.getBoundingClientRect().right - CanvasParentContainer.current.getBoundingClientRect().x
            // const parentContainerBottom = CanvasParentContainer.current.getBoundingClientRect().bottom - CanvasParentContainer.current.getBoundingClientRect().y
            // const scrollNextX = nextX - CanvasParentContainer.current.scrollLeft
            // const scrollNextY = nextY - CanvasParentContainer.current.scrollTop
            // if (parentContainerRight - scrollNextX < 70) {
            //   // const difference = parentContainerRight - scrollNextX
            //   CanvasParentContainer.current.scrollLeft += 50
            // }
            // if (parentContainerBottom - scrollNextY < 70) {
            //   CanvasParentContainer.current.scrollTop += 50
            // }
            // // Enable scrolling while dragging back
            // let scrollTop = CanvasParentContainer.current.scrollTop
            // let scrollLeft = CanvasParentContainer.current.scrollLeft
          

            // if (scrollLeft > 0 && nextX - scrollLeft < 30) {
            //   scrollLeft -= 20
            //   if (scrollLeft < 0) scrollLeft = 0
            //   CanvasParentContainer.current.scrollLeft = scrollLeft
            // }
            // if (scrollTop > 0 && nextY - scrollTop < 30) {
            //   scrollTop -= 20
            //   if (scrollTop < 0) scrollTop = 0
            //   CanvasParentContainer.current.scrollTop = scrollTop
            // }

            // update the obj top and left css styles
 
            
          }
          
          
          
        }
        document.addEventListener("mouseup", documentMouseUpHandler)
        eventTracker.current.mouseMoveEventInvoked = {status: false, event: null, element: null}
      }, [DrawPoint, objectData])


    const animationFrame = useCallback(() => {
      const {
        mouseDownEventInvoked, 
        panelMouseDownEventInvoked, 
        mouseUpEventInvoked, 
        mouseMoveEventInvoked,
        createMultiplePointEventInvoked,
        generalMouseUpEventInvoked
      } = eventTracker.current


      if (mouseMoveEventInvoked.status) 
        handleMouseMove(mouseMoveEventInvoked.event)

      if (generalMouseUpEventInvoked.status)
        handleMouseUpGeneral(generalMouseUpEventInvoked.event)

      if (mouseDownEventInvoked.status)
        handleMouseDown(mouseDownEventInvoked.event, mouseDownEventInvoked.element as HTMLElement)

      if (mouseUpEventInvoked.status)
        handleMouseUp(mouseUpEventInvoked.event, mouseUpEventInvoked.element) 

      if (panelMouseDownEventInvoked.status)
        onPanelMouseDown(panelMouseDownEventInvoked.event, panelMouseDownEventInvoked.element)
      
      if (createMultiplePointEventInvoked.status)
        createMultiplePoint(createMultiplePointEventInvoked.event, createMultiplePointEventInvoked.element)     

      animationFrameRef.current = requestAnimationFrame(animationFrame)
    }, [handleMouseDown, handleMouseMove, handleMouseUp, onPanelMouseDown, createMultiplePoint, handleMouseUpGeneral])
    

    useEffect(()=> {
      const CanvasContainer = canvasRef.current
      const elementSetRef =  eventElementSet.current
      const elementEventHandlersRef = elementEventHandlers.current
      CanvasParentContainer.current = document.getElementById("canvas-parent-container")!
      
      
      if (pageNotFound) return;
      // console.log(objects)
      const invokeLoadObjects = async () => {
        const loadedObj = await loadObjects(params.flowsheet_id)
        if (!loadedObj || loadedObj.error) {
          // window.reload()
          alert("Something went wrong, try reloading the page")
          return;
        }
        else if(loadedObj.notFound) {
          setPageNotFound(true)
          setCanvasLoading(false)
          return;
        }
        objectData.current = loadedObj as objectDataType
        hasInstance.current = true
        loadObjectToCanvas()
        setCanvasLoading(false)
      }
      if (!hasInstance.current) invokeLoadObjects()

      const canvasMouseMoveHandler = (e: MouseEvent) => {
        eventTracker.current.mouseMoveEventInvoked = {
          status: true,
          event: e,
          element: CanvasContainer
        }
      }
      const canvasMouseLeaveHandler = (e: MouseEvent) => {
        eventTracker.current.mouseUpEventInvoked = {
          status: true,
          event: e,
          element: CanvasContainer
        }
      }
      const canvasMouseUpHandler =  (e: MouseEvent) => {
        eventTracker.current.mouseUpEventInvoked = {
          status: true,
          event: e,
          element: CanvasContainer
        }
      }
          
      
      // console.log("weak maps", elementEventHandlers.current)
      // console.log("sets", eventElementSet.current)

    

      // animate frame
      animationFrameRef.current = requestAnimationFrame(animationFrame)

      // Main Project Canvas
      CanvasContainer.addEventListener("mousemove", canvasMouseMoveHandler);
      CanvasContainer.addEventListener("mouseleave", canvasMouseLeaveHandler);
      CanvasContainer.addEventListener("mouseup", canvasMouseUpHandler)

      // Sidebar Canvas
      // SidebarCanvas.addEventListener("mousemove",)
      // SidebarCanvas.addEventListener("mouseleave")
      if (!areListenersAttached.current && hasInstance.current) {
        elementSetRef.forEach((element) => {
          const elementMap = elementEventHandlersRef.get(element)
          elementMap?.forEach((handlerFn, event) => {
            element.addEventListener(event, handlerFn as EventListenerOrEventListenerObject)
          })
        })
        areListenersAttached.current = true
      }
      
      return () => {
        if (areListenersAttached.current) {
          elementSetRef.forEach((element) => {
            const elementMap = elementEventHandlersRef.get(element)
            elementMap?.forEach((handlerFn, event) => {
              element.removeEventListener(event, handlerFn as EventListenerOrEventListenerObject)
            })
          })
          areListenersAttached.current = false
        }


        CanvasContainer.removeEventListener("mousemove", canvasMouseMoveHandler);
        CanvasContainer.removeEventListener("mouseleave", canvasMouseLeaveHandler);
        CanvasContainer.removeEventListener("mouseup", canvasMouseUpHandler);
        document.removeEventListener("mouseup", documentMouseUpHandler)
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        
      }
    }, [
      objectData, hasInstance, canvasRef, pageNotFound, 
      params.flowsheet_id, setPageNotFound, setCanvasLoading, 
      loadObjectToCanvas, animationFrame
    ])

    useEffect(() => {
      let intervalRef: NodeJS.Timeout | null = null;
      if (flowsheetObject) {
        if  (!loadingUser && user && user.id !== flowsheetObject.project_creator_id) return;
        if (flowsheetObject.save_frequency_type === "AUTO" && flowsheetObject.save_frequency) {
          intervalRef = setInterval(()=> {    
              saveObjectData(params.flowsheet_id)
            
          }, Number(flowsheetObject.save_frequency) * 1000)
        }
        
      }
      return (()=> {
        if (intervalRef) clearInterval(intervalRef)
      })
    }, [flowsheetObject, params.flowsheet_id, saveObjectData, loadingUser, user])

    useEffect(() => {
      const browserCloseWarning = (e: BeforeUnloadEvent) => {

        if (isEdited && !loadingUser && user && flowsheetObject && user.id === flowsheetObject.project_creator_id) {
          e.preventDefault()
          e.returnValue = "";
        }
      }

      // history.pushState(null, "", location.href);
      /** 
      const beforePopState = (event: PopStateEvent) => {
        // This triggers when the user clicks Back or Forward
        console.log("popstate event", event)
        if (isEdited) {
          
          event.preventDefault(); // Doesn’t actually stop it
  
          const leave = confirm("You have Unsaved changes. Are you sure you want to go back?");
          if (leave) {
            router.back(); // proceed

          } else {
            history.pushState(null, '', window.location.href); // cancel by restoring state
          }
        
        }
      }
        */
      window.addEventListener('beforeunload', browserCloseWarning)
      // window.addEventListener('popstate', beforePopState)
      return () => {
        window.removeEventListener('beforeunload', browserCloseWarning)
        // window.removeEventListener('popstate', beforePopState)
      }
    },[isEdited, flowsheetObject, user, loadingUser])

  return (
    <>
      {
        canvasLoading ? (<div className="relative w-full h-full bg-[#00000080] z-20 flex justify-center items-center"> 
          <Loader fullScreen={false} offsetHeightClass="h-[calc(100vh-60px)]" color="[#006644]"/>
         </div>): ""
      }
      {
        pageNotFound ? <div className="relative w-full h-full z-10 flex justify-center items-center">
          Page not found
        </div> :  (
          <main className="relative overflow-scroll custom-scrollbar bg-white h-full w-full">
            <div className={`relative overflow-hidden h-[${canvasContainerContentHeight}px] w-[${canvasContainerContentWidth}px]`}>             

              <div className="relative overflow-hidden z-1 canvas-bg grid-bg w-[10000px] h-[10000px]">
                <div onDragOver={isOpened ? (e)=>false :  (e)=> e.preventDefault()} className="relative z-2 cursor-move overflow-hidden w-full h-full opacity-2" ref={canvasRef} onDrop={handleDrop} >
                    { 
                      isOpened &&<ObjectForm formFields={formFields} position={objectFormPosition} handleFormState={handleFormState} saveForm={handleFormSave} closeFormUnsaved={closeFormUnsaved} formState={formState as formStateObjectType} objectFormType={objectFormType.current}/>
                    }
                  </div>
              </div>
            </div>

        </main>
          
          
          // <div onDragOver={isOpened ? (e)=>false :  (e)=> e.preventDefault()} className="canvas-bg relative bg-white cursor-move overflow-auto h-[2000px] w-[2000px]" ref={canvasRef} onDrop={handleDrop}>
          //         { 
          //           isOpened &&<ObjectForm formFields={formFields} position={objectFormPosition} handleFormState={handleFormState} saveForm={handleFormSave} formState={formState as formStateObjectType} objectFormType={objectFormType.current}/>
          //         }
          //       </div>
        )
      }
      
     
    
    </>
  )
}
export default Canvas
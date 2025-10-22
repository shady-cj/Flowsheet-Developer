"use client";
import { useEffect, useState, useRef, useCallback, DragEvent, ChangeEvent, FormEvent, useContext } from "react";
import { uploadObject, loadObjects } from "@/lib/actions/flowsheetcanvas";
import ObjectForm from "./ObjectForm";
import { FlowsheetContext } from "../context/FlowsheetProvider";
import { objectDataType, lineCordsType,  objectCoords} from "../context/FlowsheetProvider";
import { ObjectCreator } from "../Objects/ObjectCreator";
import { renderToStaticMarkup } from "react-dom/server"
import arrowDown from "@/assets/arrow-down.svg"
import arrowUp from "@/assets/arrow-up.svg"
import Loader from "../utils/loader";
import { concentratorAnalysis } from "@/lib/utils/concentrator-analysis";


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
    const [isOpened, setIsOpened] = useState<boolean>(false)
    const onPanelResize = useRef(false)
    const mouseMoved = useRef(false)
    const panelCoordinateXMarker = useRef<number | null>(null)
    const panelCoordinateYMarker = useRef<number | null>(null)
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

        
        if (nextObject?.properties.gape || nextObject?.properties.aperture) {
          if (!activeObject.properties.gape && !activeObject.properties.aperture) return true // skip (no need for validating connection)
          if (activeObject.properties.aperture)
            activeObject.properties.maxOreSize = activeObject.properties.aperture
          else if (activeObject.properties.gape) 
            activeObject.properties.maxOreSize = activeObject.properties.set
          else
            return false

          const feedSize = parseFloat(activeObject.properties.maxOreSize!)
          if (nextObject.properties.gape) {
            const gape = parseFloat(nextObject.properties.gape)
            if ((0.8 * gape) >= feedSize) {
              // largest feed size must be less than or equal to 0.8 x gape size
              if (activeObject.properties.set && (parseFloat(activeObject.properties.set) <= parseFloat(nextObject.properties.set!)))
                nextObject.properties.maxOreSize = activeObject.properties.set
              else
                nextObject.properties.maxOreSize = nextObject.properties.set
              return true
            }
            return false
          } else if (nextObject.properties.aperture) {
            const apertureSize = parseFloat(nextObject.properties.aperture)
            if (feedSize <= apertureSize) {
              nextObject.properties.maxOreSize = nextObject.properties.aperture
              return true
            }
            return false
          }
        }
        
        return true
      }
      if (type === "to") {
        // console.log("to here")
        const prevObjectId = line.properties.prevObject[0]

    

        if (!prevObjectId) return true
        const prevObject = objectData.current[prevObjectId]
        // console.log("active object", activeObject)
        // console.log("prev objectId", prevObject)
    
        if (!prevObject) return true
        if (activeObject.properties.gape || activeObject.properties.aperture) {
          
          if (!prevObject.properties.gape && !prevObject.properties.aperture) return true // review
    
          // if (!prevObject.properties.maxOreSize) {
          if (prevObject.properties.aperture)
            prevObject.properties.maxOreSize = prevObject.properties.aperture
          else if (prevObject.properties.gape) 
            prevObject.properties.maxOreSize = prevObject.properties.set
          else
            return false

          // } 
    
          const feedSize = parseFloat(prevObject.properties.maxOreSize!) 
          if (activeObject.properties.gape) {
            const gape = parseFloat(activeObject.properties.gape)
            if ((0.8 * gape) >= feedSize) {
              if (feedSize < parseFloat(activeObject.properties.set!))
                activeObject.properties.maxOreSize = feedSize.toString()
              else
                activeObject.properties.maxOreSize = activeObject.properties.set
              return true
            }
            return false
          } else if(activeObject.properties.aperture) {
            const apertureSize = parseFloat(activeObject.properties.aperture)
            if (feedSize <= apertureSize) {
              activeObject.properties.maxOreSize = activeObject.properties.aperture
              return true
            }
            return false
          }
        }
        if (activeObject.object?.model_name === "Concentrator") {
          if (prevObject.properties.oreQuantity) activeObject.properties.oreQuantity = prevObject.properties.oreQuantity
          else activeObject.properties.oreQuantity = activeObject.properties.defaultOreQuantity
          if (prevObject.properties.oreGrade) activeObject.properties.oreGrade = prevObject.properties.oreGrade
          else activeObject.properties.oreGrade = activeObject.properties.defaultOreGrade
          // if (prevObject.properties.)
        }
        if (activeObject.object?.model_name === "Auxilliary" && activeObject.object?.type === "ore") {
          if (prevObject.properties.maxOreSize) activeObject.properties.maxOreSize = prevObject.properties.maxOreSize
          else activeObject.properties.maxOreSize = activeObject.properties.defaultMaxOreSize

          if (prevObject.properties.oreQuantity) activeObject.properties.oreQuantity = prevObject.properties.oreQuantity
          else activeObject.properties.oreQuantity = activeObject.properties.defaultOreQuantity
        }
        return true
      }

    }, [objectData])


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



        // Getting the scale of the shape
        const scale = +getComputedStyle(shape).transform.replace("matrix(", "").split(",")[0].trim()
        const extrasX = shapeWidth - (shapeWidth / scale) // in the case of scaled object we need to know how much they scaled by so we can subtract the excess while positioning our lines
        const extrasY = shapeHeight - (shapeHeight / scale)
        const scaledShapeOffsetY = shapeOffsetY - (extrasY / 2)
        const scaledShapeOffsetX = shapeOffsetX - (extrasX / 2)




        // scenario 1: Drawing from the top:
        if (lYAxis === scaledShapeOffsetY || ((lYAxis - scaledShapeOffsetY) >= -10 && (lYAxis < shapeOffsetYBottom) )) {
          


          if ((lXAxis >= scaledShapeOffsetX && lXAxis <= shapeOffsetXRight) && checkAndSetConnection("to", obj.id, shapeId)) {
            
            isConnected = true
            // Ensure the point is within the box range on x axis
            if (lYAxis < scaledShapeOffsetY) {
              const pointGap = shapeOffsetY - lYAxis           
              coordinates.L[coordinates.L.length - 1][1] = parseFloat((L[1] + pointGap - (extrasY/2)).toFixed(6))
              const pathDString = LineCoordinateToPathString(coordinates)
              point.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
              arrowContainer.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
              path?.setAttribute("d", pathDString)
            }


            
            objectData.current[obj.id].properties.nextObject[0] = shapeId

            const prevObject = objectData.current[obj.id].properties.prevObject[0]

            // for (const prevObj of prevObject ) {


            // }
            if (prevObject && objectData.current[prevObject]) {
              if (!objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)
      
              
              if (!objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // Delete prev Object because it doesn't exist anymore
                if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                  const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                  objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
                }
            }
          }
        }

        
        // scenario 2: Drawing from the bottom
        if (lYAxis === shapeOffsetYBottom ||  ((lYAxis - shapeOffsetYBottom) <= 10 && (lYAxis > scaledShapeOffsetY) )) {


          
          if ((lXAxis >= scaledShapeOffsetX && lXAxis <= shapeOffsetXRight) && checkAndSetConnection("to", obj.id, shapeId)) {
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


            objectData.current[obj.id].properties.nextObject[0] = shapeId

            const prevObject = objectData.current[obj.id].properties.prevObject[0]
            // for (const prevObj of prevObject ) {

            // }
            if (prevObject && objectData.current[prevObject]) {
              if (!objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)
      
              
              if (!objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // Delete prev Object because it doesn't exist anymore
                if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                  const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                  objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
                }
            }

          }
        }

        // scenario 3: Drawing from the right

        if (lXAxis === shapeOffsetXRight || ((lXAxis - shapeOffsetXRight) <= 10 && (lXAxis > scaledShapeOffsetX) )) {
          if ((lYAxis >= scaledShapeOffsetY && lYAxis <= shapeOffsetYBottom) && checkAndSetConnection("to", obj.id, shapeId)) {
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


            objectData.current[obj.id].properties.nextObject[0] = shapeId

            const prevObject = objectData.current[obj.id].properties.prevObject[0]
            // for (const prevObj of prevObject ) {

            // }
            if (prevObject && objectData.current[prevObject]) {
              if (!objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)
      
              
              if (!objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // Delete prev Object because it doesn't exist anymore
                if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                  const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                  objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
                }
            }

          }
        }

        // scenario 4: Drawing from the left

        if (lXAxis === scaledShapeOffsetX || ((lXAxis - scaledShapeOffsetX) >= -10 && (lXAxis < shapeOffsetXRight) )) {
          if ((lYAxis >= scaledShapeOffsetY && lYAxis <= shapeOffsetYBottom) && checkAndSetConnection("to", obj.id, shapeId)) {
            isConnected = true

            if (lXAxis < scaledShapeOffsetX) {

              // Ensure the point is within the box range on y axis
              const pointGap = shapeOffsetX - lXAxis
              coordinates.L[coordinates.L.length - 1][0] = parseFloat((L[0] + pointGap - (extrasX / 2)).toFixed(6))
              const pathDString = LineCoordinateToPathString(coordinates)
              point.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
              arrowContainer.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
              path?.setAttribute("d", pathDString)
            }


            objectData.current[obj.id].properties.nextObject[0] = shapeId

            const prevObject = objectData.current[obj.id].properties.prevObject[0]
            // for (const prevObj of prevObject ) {

            // }
            if (prevObject && objectData.current[prevObject]) {
              if (!objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)
      
              
              if (!objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // Delete prev Object because it doesn't exist anymore
                if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                  const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                  objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
                }
            }

          }
        }

        if (!isConnected) {
            const getObjNextObject = objectData.current[obj.id].properties.nextObject[0];
            
            if (!objectData.current[getObjNextObject]) {
              objectData.current[obj.id].properties.nextObject.splice(0, 1)
            }
            else if (getObjNextObject === shapeId) {
              objectData.current[obj.id].properties.nextObject.splice(0, 1)
              const prevObject = objectData.current[obj.id].properties.prevObject[0]
              if (prevObject && objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
              }
              if (prevObject && objectData.current[prevObject].properties.nextObject.includes(shapeId)) {
                const getNextObjectIndex = objectData.current[prevObject].properties.nextObject.indexOf(shapeId)
                objectData.current[prevObject].properties.nextObject.splice(getNextObjectIndex, 1)

              }
            } 

        }

        console.log('is connected', isConnected)
        if (objectData.current[obj.id].properties.nextObject[0] && objectData.current[obj.id].properties.prevObject[0]) {
          path!.setAttribute("stroke", "#4D4D4D")
          arrow.setAttribute("fill", "#4D4D4D")
        } else {
          path!.setAttribute("stroke", "#beb4b4")
          arrow.setAttribute("fill", "#beb4b4")

        }
      }
    }, [objectData,canvasRef, checkAndSetConnection])



    const LineToShape = useCallback((obj: HTMLElement) => {
      for (const shapeId in objectData.current) {
        if (obj.id === shapeId)
          continue
        const shape = document.getElementById(shapeId) as HTMLElement;
        if (!shape) continue
        if (shape.getAttribute("data-variant") === "text" || shape.getAttribute("data-variant") === "line")
          continue

        let isConnected = false // to detect when line is disconnected
        const shapeOffsetX = shape.offsetLeft
        const shapeOffsetY = shape.offsetTop
        const shapeOffsetYBottom = shape.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
        const shapeOffsetXRight = shape.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
        const shapeWidth =  shape.getBoundingClientRect().width
        const shapeHeight =  shape.getBoundingClientRect().height



        const path = obj.querySelector("svg.line-svg path")
        const arrow = obj.querySelector("svg.arrow-indicator polygon") as SVGPolygonElement
        const offsetLineX = obj.offsetLeft
        const offsetLineY = obj.offsetTop
        const lineData = objectData.current[obj.id].properties.coordinates
        const coordinates = lineData.lineCoordinates!
        const M = coordinates.M
        const L = coordinates.L[coordinates.L.length - 1]
        const mXAxis = M[0] + offsetLineX
        const mYAxis = M[1] + offsetLineY
        const lXAxis = L[0] + offsetLineX
        const lYAxis = L[1] + offsetLineY

        // Getting the scale of the shape
        const scale = +getComputedStyle(shape).transform.replace("matrix(", "").split(",")[0].trim()
        const extrasX = shapeWidth - (shapeWidth / scale) // in the case of scaled object we need to know how much they scaled by so we can subtract the excess while positioning our lines
        const extrasY = shapeHeight - (shapeHeight / scale)
        const scaledShapeOffsetY = shapeOffsetY - (extrasY / 2)
        const scaledShapeOffsetX = shapeOffsetX - (extrasX / 2)

        

        if (shapeOffsetYBottom === mYAxis || ((mYAxis - shapeOffsetYBottom) <= 10 && (mYAxis > scaledShapeOffsetY) )) {
          // Dragging the line in from the bottom (M coordinates)
          if ((mXAxis >= scaledShapeOffsetX && mXAxis <= shapeOffsetXRight) && checkAndSetConnection("from", obj.id, shapeId)) {
            // console.log("Dragging the line in from the bottom (M coordinates)")
            isConnected = true
            // const shapeWidthMidpoint = shapeWidth / 2
            // const newLineOffsetX = shapeOffsetX + shapeWidthMidpoint - M[0] - (extrasX/2)
            if (mYAxis > shapeOffsetYBottom) {

              const newLineOffsetY = parseFloat((shapeOffsetYBottom - M[1]).toFixed(6))
             
              obj.style.top = `${newLineOffsetY}px`;
              objectData.current[obj.id].properties.coordinates.lastY = newLineOffsetY

            }
            // obj.style.left = `${newLineOffsetX}px`;
            // objectData.current[obj.id].lastX = newLineOffsetX




            // Setting the line previous attribute
            objectData.current[obj.id].properties.prevObject[0] = shapeId

            const nextObject = objectData.current[obj.id].properties.nextObject[0]
            // setting the current shape next object to the line next object
            if (nextObject && objectData.current[nextObject]) {
              if (!objectData.current[shapeId].properties.nextObject.includes(nextObject))
                objectData.current[shapeId].properties.nextObject.push(nextObject)
  
              if (!objectData.current[nextObject].properties.prevObject.includes(shapeId))
                objectData.current[nextObject].properties.prevObject.push(shapeId)
            } else if (nextObject && !objectData.current[nextObject]) {
                if (objectData.current[shapeId].properties.nextObject.includes(nextObject)){
                  const indexOfNextObjectId = objectData.current[shapeId].properties.nextObject.indexOf(nextObject)
                  objectData.current[shapeId].properties.nextObject.splice(indexOfNextObjectId, 1)
                }
            }
            
          }
        }

        if (scaledShapeOffsetY === lYAxis || ((lYAxis - scaledShapeOffsetY) >= -10 && (lYAxis < shapeOffsetYBottom) )) {
          // Dragging the line in from the top (L coordinates)
          if ((lXAxis >= scaledShapeOffsetX && lXAxis <= shapeOffsetXRight) && checkAndSetConnection("to", obj.id, shapeId)) {
            // console.log("Dragging the line in from the top (L coordinates)")
            isConnected = true
            // const shapeWidthMidpoint = shapeWidth / 2
            // const newLineOffsetX = shapeOffsetX + shapeWidthMidpoint - L[0] - (extrasX/2)
            if (lYAxis < scaledShapeOffsetY) {

              const newLineOffsetY = parseFloat((scaledShapeOffsetY - L[1]).toFixed(6))
              if (newLineOffsetY < 6)
                return
              obj.style.top = `${newLineOffsetY}px`;
              // obj.style.left = `${newLineOffsetX}px`;
              // objectData.current[obj.id].lastX = newLineOffsetX
              objectData.current[obj.id].properties.coordinates.lastY = newLineOffsetY
            }




            // setting the line/object next object to the current shape id(could be any object)
            objectData.current[obj.id].properties.nextObject[0] = shapeId


            const prevObject = objectData.current[obj.id].properties.prevObject[0]
            // setting the shape previous attribute to the line previous object

            if (prevObject && objectData.current[prevObject]) {
              if (prevObject && !objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)
  
              if (prevObject && !objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // removing the prev object id from the current shape  previous object attribute in case there's a prevObjectId
              if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
              }
            }
            
            
          }
        }


        if (scaledShapeOffsetX === mXAxis || ((mXAxis - scaledShapeOffsetX) >= -10 && (mXAxis < shapeOffsetXRight)) ) {
          // Dragging the line in from the left (for M coordinates)
          if ((mYAxis >= scaledShapeOffsetY && mYAxis <= shapeOffsetYBottom) && checkAndSetConnection("from", obj.id, shapeId)) {
            // console.log("Dragging the line in from the left (for M coordinates)")
            isConnected = true
            // const shapeHeightMidpoint = shapeHeight / 2
            if (mXAxis < scaledShapeOffsetX) {
              
              const newLineOffsetX = parseFloat((scaledShapeOffsetX - M[0]).toFixed(6))
              // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - M[1] - (extrasY/2)
              if (newLineOffsetX < 6)
                return
              // obj.style.top = `${newLineOffsetY}px`;
              obj.style.left = `${newLineOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
            }
            // objectData.current[obj.id].lastY = newLineOffsetY


            
            // Setting the line previous attribute
            objectData.current[obj.id].properties.prevObject[0] = shapeId

            const nextObject = objectData.current[obj.id].properties.nextObject[0]
            // setting the current shape next object to the line next object
            if (nextObject && objectData.current[nextObject]) {
              if (!objectData.current[shapeId].properties.nextObject.includes(nextObject))
                objectData.current[shapeId].properties.nextObject.push(nextObject)
  
              if (!objectData.current[nextObject].properties.prevObject.includes(shapeId))
                objectData.current[nextObject].properties.prevObject.push(shapeId)
            } else if (nextObject && !objectData.current[nextObject]) {
                if (objectData.current[shapeId].properties.nextObject.includes(nextObject)){
                  const indexOfNextObjectId = objectData.current[shapeId].properties.nextObject.indexOf(nextObject)
                  objectData.current[shapeId].properties.nextObject.splice(indexOfNextObjectId, 1)
                }
            }
            
          }
        }

        if (shapeOffsetXRight === mXAxis || ((mXAxis - shapeOffsetXRight) <= 10 && (mXAxis > scaledShapeOffsetX) )) {
          // Dragging the line in from the right (for M coordinates)
          if ((mYAxis >= scaledShapeOffsetY && mYAxis <= shapeOffsetYBottom) && checkAndSetConnection("from", obj.id, shapeId)) {
            // console.log("Dragging the line in from the right (for M coordinates)")
            isConnected = true
            // const shapeHeightMidpoint = shapeHeight / 2
            if (mXAxis > shapeOffsetXRight) {

              const newLineOffsetX = parseFloat((shapeOffsetXRight - M[0]).toFixed(6))
          
              // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - M[1] - (extrasY/2)
              // obj.style.top = `${newLineOffsetY}px`;
              obj.style.left = `${newLineOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
              // objectData.current[obj.id].lastY = newLineOffsetY
            }


            
            // Setting the line previous attribute
            objectData.current[obj.id].properties.prevObject[0] = shapeId

            const nextObject = objectData.current[obj.id].properties.nextObject[0]
            // setting the current shape next object to the line next object
            if (nextObject && objectData.current[nextObject]) {
              if (!objectData.current[shapeId].properties.nextObject.includes(nextObject))
                objectData.current[shapeId].properties.nextObject.push(nextObject)
  
              if (!objectData.current[nextObject].properties.prevObject.includes(shapeId))
                objectData.current[nextObject].properties.prevObject.push(shapeId)
            } else if (nextObject && !objectData.current[nextObject]) {
                if (objectData.current[shapeId].properties.nextObject.includes(nextObject)){
                  const indexOfNextObjectId = objectData.current[shapeId].properties.nextObject.indexOf(nextObject)
                  objectData.current[shapeId].properties.nextObject.splice(indexOfNextObjectId, 1)
                }
            }
          }
        }

        if (scaledShapeOffsetX === lXAxis || ((lXAxis - scaledShapeOffsetX) >= -10 && (lXAxis < shapeOffsetXRight) )) {
          // Dragging the line in from the left (for L coordinates)
          if ((lYAxis >= scaledShapeOffsetY && lYAxis <= shapeOffsetYBottom) && checkAndSetConnection("to", obj.id, shapeId)) {
            // console.log("Dragging the line in from the left (for L coordinates)")
            isConnected = true
            // const shapeHeightMidpoint = shapeHeight / 2
            if (lXAxis < scaledShapeOffsetX) {
             
              const newLineOffsetX = parseFloat((scaledShapeOffsetX - L[0]).toFixed(6))
              // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - L[1] - (extrasY/2)
              if (newLineOffsetX < 6)
                return
              // obj.style.top = `${newLineOffsetY}px`;
              obj.style.left = `${newLineOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
              // objectData.current[obj.id].lastY = newLineOffsetY
            }



            // setting the line/object next object to the current shape id(could be any object)
            objectData.current[obj.id].properties.nextObject[0] = shapeId


            const prevObject = objectData.current[obj.id].properties.prevObject[0]
            // setting the shape previous attribute to the line previous object

            if (prevObject && objectData.current[prevObject]) {
              if (prevObject && !objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)
  
              if (prevObject && !objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // removing the prev object id from the current shape  previous object attribute in case there's a prevObjectId
              if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
              }
            }
          }
        }

        if (shapeOffsetXRight === lXAxis || ((lXAxis - shapeOffsetXRight) <= 10 && (lXAxis > scaledShapeOffsetX) )) {
          // Dragging the line in from the right (for L coordinates)
          if ((lYAxis >= scaledShapeOffsetY && lYAxis <= shapeOffsetYBottom) && checkAndSetConnection("to", obj.id, shapeId)) {
            // console.log("Dragging the line in from the right (for L coordinates)")
            isConnected = true


            if (lXAxis > shapeOffsetXRight) {
              // const shapeHeightMidpoint = shapeHeight / 2
            const newLineOffsetX = parseFloat((shapeOffsetXRight - L[0]).toFixed(6))
            // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - L[1] - (extrasY/2)
            // obj.style.top = `${newLineOffsetY}px`;
            obj.style.left = `${newLineOffsetX}px`;
            objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
            // objectData.current[obj.id].lastY = newLineOffsetY
            
            }
            


           // setting the line/object next object to the current shape id(could be any object)
           objectData.current[obj.id].properties.nextObject[0] = shapeId


           const prevObject = objectData.current[obj.id].properties.prevObject[0]
           // setting the shape previous attribute to the line previous object

           if (prevObject && objectData.current[prevObject]) {
              if (prevObject && !objectData.current[shapeId].properties.prevObject.includes(prevObject))
                objectData.current[shapeId].properties.prevObject.push(prevObject)

              if (prevObject && !objectData.current[prevObject].properties.nextObject.includes(shapeId)) 
                objectData.current[prevObject].properties.nextObject.push(shapeId)
            } else if (prevObject && !objectData.current[prevObject]) {
              // removing the prev object id from the current shape  previous object attribute in case there's a prevObjectId
              if (objectData.current[shapeId].properties.prevObject.includes(prevObject)) {
                const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObject)
                objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
              }
            }
          }
        }

        if (!isConnected) {
          // console.log('got here (not isConnected)')
          // console.log(objectData.current[shapeId])
          /**
           * 
           * STEPS TO CAREFULLY DISCONNECTING THE LINES
             * 1. check the current obj previous and next shape to remove it
             * 2. if it's the obj's previous shape that is equivalent to the current shape id (M coordinates)
             *     - remove the current shape id from the previous shape id arrays of the obj
             *     - get the obj's nextObject id
             *     - remove the obj's nextObject id from the current shape's nextObject id arrays
             *     - remove the shape id from nextObject's previous id arrays
             * 3. if it's the obj's next shape id that is equivalent to the current shape id (L coordinates)
             *     - remove the current shape id from the next shape id arrays of the obj
             *     - get the obj's previous shape id
             *     - remove the obj's previous shape id from the current shape's prevObject id arrays
             *     - remove the current shape id from the previous shape's nextObject id arrays
             *    
             *      
             */
          // There is a disconnection or there was never a connection
          // Scenarios: 
          // 1. disconnection from the lines M coordinates
          // 2. disconnection from the lines L coordinates
          // 3. no connection existed in the first place

          let getCurrentLinePrevObjectId: string | null = objectData.current[obj.id].properties.prevObject[0]
          let getCurrentLineNextObjectId: string | null = objectData.current[obj.id].properties.nextObject[0]

          // Check if the id still exists.
          if (!objectData.current[getCurrentLineNextObjectId])  {
            objectData.current[obj.id].properties.nextObject.splice(0, 1)
            getCurrentLineNextObjectId = null
          }
          if (!objectData.current[getCurrentLinePrevObjectId]) {
            objectData.current[obj.id].properties.prevObject.splice(0, 1)
            getCurrentLinePrevObjectId = null
          }

          // 1. disconnection from the lines M coordinates         
          
          if (getCurrentLinePrevObjectId === shapeId) {
            // remove current shape id as the line's prevObject 
            objectData.current[obj.id].properties.prevObject.splice(0, 1)

            // getting the line's nextObject id
            const nextObjectId = objectData.current[obj.id].properties.nextObject[0]

            // removing the previous object from the current shape's next object attribute in case there's a nextObjectId
           
            if (nextObjectId && objectData.current[shapeId].properties.nextObject.includes(nextObjectId)){
              const indexOfNextObjectId = objectData.current[shapeId].properties.nextObject.indexOf(nextObjectId)
              objectData.current[shapeId].properties.nextObject.splice(indexOfNextObjectId, 1)
            }
            // removing the current shape id from the nextObject's prevObject id arrays
            if (nextObjectId && objectData.current[nextObjectId].properties.prevObject.includes(shapeId)){
              const indexOfCurrentObjectId = objectData.current[nextObjectId].properties.prevObject.indexOf(shapeId)
              objectData.current[nextObjectId].properties.prevObject.splice(indexOfCurrentObjectId, 1)
            }
          }
          // 2. disconnection from the lines L coordinates
          else if (getCurrentLineNextObjectId === shapeId) {
            // remove current shape id as the line's nextObject 
            objectData.current[obj.id].properties.nextObject.splice(0, 1)

            // getting the line's prevObject id
            const prevObjectId = objectData.current[obj.id].properties.prevObject[0]


             // removing the prev object id from the current shape  previous object attribute in case there's a prevObjectId
             if (prevObjectId && objectData.current[shapeId].properties.prevObject.includes(prevObjectId)) {
               const getPrevObjectIndex = objectData.current[shapeId].properties.prevObject.indexOf(prevObjectId)
               objectData.current[shapeId].properties.prevObject.splice(getPrevObjectIndex, 1)
             }

             // removing the current shape id from the prevObject's nextObject id arrays
             if (prevObjectId && objectData.current[prevObjectId].properties.nextObject.includes(shapeId)) {
               const getNextObjectIndex = objectData.current[prevObjectId].properties.nextObject.indexOf(shapeId)
               objectData.current[prevObjectId].properties.nextObject.splice(getNextObjectIndex, 1)
             }

          }

          // 3. no connection existed in the first place 
          // Nothing happens
          
        }

        console.log('is connected (line-to-shape)', isConnected)
        console.log("line data", objectData.current[obj.id])
        console.log("shape data", objectData.current[shape.id])
        console.log("\n")
        console.log("\n")

        if (objectData.current[obj.id].properties.nextObject[0] && objectData.current[obj.id].properties.prevObject[0]) {
          path!.setAttribute("stroke", "#4D4D4D")
          arrow.setAttribute("fill", "#4D4D4D")
          
        } else {
          path!.setAttribute("stroke", "#beb4b4")
          arrow.setAttribute("fill", "#beb4b4")
        }
      }
    }, [objectData, canvasRef, checkAndSetConnection])





    const ShapeToLine = useCallback((obj: HTMLElement) => {
        // Get all the lines
        const lines = document.querySelectorAll("[data-variant=line]")
        lines.forEach(line => {
          // For each line check if the currentObject been dragged/move is in contact with the any line or with 5px range
          let isConnected = false // to keep track of disconnections
          const objectOffsetX = obj.offsetLeft
          const objectOffsetY = obj.offsetTop
          const objectOffsetYBottom = obj.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
          const objectOffsetXRight = obj.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
          const objectHeight = obj.getBoundingClientRect().height
          const objectWidth = obj.getBoundingClientRect().width

          
          const path = line.querySelector("svg.line-svg path")
          const arrow = line.querySelector("svg.arrow-indicator polygon") as SVGPolygonElement
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

          // Getting the scale of the shape
          const scale = +getComputedStyle(obj).transform.replace("matrix(", "").split(",")[0].trim() // Since scale x,y would be the same
          const extrasX = objectWidth - (objectWidth / scale) // in the case of scaled object we need to know how much they scaled by so we can subtract the excess while positioning our lines
          const extrasY = objectHeight - (objectHeight / scale)
          const scaledObjectOffsetY = objectOffsetY - (extrasY / 2)
          const scaledObjectOffsetX = objectOffsetX - (extrasX / 2)
         

          // Dragging a component from the bottom to the M-coordinate of a line
          if (scaledObjectOffsetY === mYAxis || ((mYAxis - scaledObjectOffsetY >= -10) &&  mYAxis < objectOffsetYBottom)) {
            if ((scaledObjectOffsetX <= mXAxis && objectOffsetXRight >= mXAxis) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
              isConnected = true

              if (mYAxis < objectOffsetY) {
                const newObjectOffsetY = parseFloat((mYAxis + (extrasY/2)).toFixed(6))
                if (newObjectOffsetY < 6)
                  return
                obj.style.top = `${newObjectOffsetY}px`;
                objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
              }

              MCoordinateConnection(obj, line)
            }
          }


          // Dragging a component from the top to the M-coordinate of a line
          if (objectOffsetYBottom === mYAxis || ((mYAxis - objectOffsetYBottom) <= 10 && (mYAxis > scaledObjectOffsetY) )) {
    
            // dragging the object from the top.
            if ((mXAxis >= scaledObjectOffsetX && mXAxis <= objectOffsetXRight) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
              isConnected = true

             
              // const objWidthMidpoint = objectWidth / 2
              // const newObjectOffsetX = mXAxis - objWidthMidpoint + (extrasX/2)
              if (mYAxis > objectOffsetYBottom) {

                const newObjectOffsetY = parseFloat((mYAxis - objectHeight + (extrasY/2)).toFixed(6))
                // console.log(mYAxis, "myaxis")
                if (newObjectOffsetY < 6)
                  return
                obj.style.top = `${newObjectOffsetY}px`;
                // obj.style.left = `${newObjectOffsetX}px`;
                // objectData.current[obj.id].lastX = newObjectOffsetX
                objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
              }
              // if (objectData.current[line.id].properties.prevObject[0])
              //   return
              MCoordinateConnection(obj, line)
  
            }
          }
          
          
          // Dragging a component from the left to the M-coordinate of a line
          if (objectOffsetXRight === mXAxis || ((mXAxis - objectOffsetXRight) <= 10  && (mXAxis > scaledObjectOffsetX) )) {
            // Dragging the object in from the left (for M coordinates)
            if ((mYAxis >= scaledObjectOffsetY && mYAxis <= objectOffsetYBottom) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {
              isConnected = true
              

              if (mXAxis > objectOffsetXRight) {

                // const objHeightMidpoint = objectHeight / 2
                const newObjectOffsetX = parseFloat((mXAxis - objectWidth + (extrasX/2)).toFixed(6))
                // const newObjectOffsetY = mYAxis - objHeightMidpoint + (extrasY/2)
                if (newObjectOffsetX < 6)
                  return
                // obj.style.top = `${newObjectOffsetY}px`;
                obj.style.left = `${newObjectOffsetX}px`;
                objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                // objectData.current[obj.id].lastY = newObjectOffsetY
              }
              // if (objectData.current[line.id].properties.prevObject[0])
              //   return


              MCoordinateConnection(obj, line)

            }
          }
          

          // Dragging a component from the right to the M-coordinate of a line
          if (scaledObjectOffsetX === mXAxis || ((mXAxis - scaledObjectOffsetX) >= -10 && (mXAxis < objectOffsetXRight) )) {
            // Dragging the object in from the right (for M coordinates)
            if ((mYAxis >= scaledObjectOffsetY && mYAxis <= objectOffsetYBottom) && checkAndSetConnection("from", line.id, obj.id) && !isConnected) {

              isConnected = true
              
              // const objHeightMidpoint = objectHeight / 2

              if (mXAxis < scaledObjectOffsetX) {

                const newObjectOffsetX = parseFloat((mXAxis + (extrasX/2)).toFixed(6))
                // const newObjectOffsetY = mYAxis - objHeightMidpoint + (extrasY/2)
                // obj.style.top = `${newObjectOffsetY}px`;
                obj.style.left = `${newObjectOffsetX}px`;
                objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                // objectData.current[obj.id].lastY = newObjectOffsetY
              }

               
              MCoordinateConnection(obj, line)

            }
          }
          


          // Dragging a component from the top to the L-coordinate of a line
          if (objectOffsetYBottom === lYAxis || ((lYAxis -  objectOffsetYBottom) <= 10 && (lYAxis > scaledObjectOffsetY))) {
            if ((lXAxis >= scaledObjectOffsetX && lYAxis <= objectOffsetXRight) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
              isConnected = true
              if (lYAxis > objectOffsetYBottom) {
                const newObjectOffsetY = parseFloat((lYAxis - objectHeight + (extrasY/2)).toFixed(6))
                obj.style.top = `${newObjectOffsetY}px`;
                objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
              }
              LCoordinateConnection(obj, line)
            }
          }



          // Dragging a component from the bottom to the L-coordinate of a line
          if (scaledObjectOffsetY === lYAxis || ((lYAxis - scaledObjectOffsetY) >= -10 && (lYAxis < objectOffsetYBottom) )) {
            // Dragging the object in from bottom (L coordinates)
            if ((lXAxis >= scaledObjectOffsetX && lXAxis <= objectOffsetXRight) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
             
              isConnected = true
             
              // const objWidthMidpoint = objectWidth / 2
              // const newObjectOffsetX = lXAxis - objWidthMidpoint + (extrasX/2)
              if (lYAxis < scaledObjectOffsetY) {

                const newObjectOffsetY = parseFloat((lYAxis + (extrasY/2)).toFixed(6))
                // console.log(mYAxis, "myaxis")
  
                obj.style.top = `${newObjectOffsetY}px`;
                // obj.style.left = `${newObjectOffsetX}px`;
                // objectData.current[obj.id].lastX = newObjectOffsetX
                objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY
              }
              LCoordinateConnection(obj, line)
              
            }
          }
         
        
          // Dragging a component from the left to the L-coordinate of a line
          if (objectOffsetXRight === lXAxis || ((lXAxis - objectOffsetXRight) <= 10 && (lXAxis > scaledObjectOffsetX) )) {
            // Dragging the object in from the left (for L coordinates)
           
            if ((lYAxis >= scaledObjectOffsetY && lYAxis <= objectOffsetYBottom) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
              isConnected = true

            
              // const objHeightMidpoint = objectHeight / 2

              if (lYAxis > objectOffsetXRight) {
                const newObjectOffsetX = parseFloat((lXAxis - objectWidth + (extrasX/2)).toFixed(6))
                // const newObjectOffsetY = lYAxis - objHeightMidpoint + (extrasY/2)
                if (newObjectOffsetX < 6)
                  return
                // obj.style.top = `${newObjectOffsetY}px`;
                obj.style.left = `${newObjectOffsetX}px`;
                objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                // objectData.current[obj.id].lastY = newObjectOffsetY
              }


              LCoordinateConnection(obj, line)
            }
          }

          // Dragging a component from the right to the L-coordinate of a line
          if (scaledObjectOffsetX === lXAxis || ((lXAxis - scaledObjectOffsetX) >= -10 && (lXAxis < objectOffsetXRight) )) {
            // Dragging the object in from the right (for L coordinates)
            if ((lYAxis >= scaledObjectOffsetY && lYAxis <= objectOffsetYBottom) && checkAndSetConnection("to", line.id, obj.id) && !isConnected) {
              isConnected = true
              
              // const objHeightMidpoint = objectHeight / 2

              if (lXAxis < scaledObjectOffsetX) {

                const newObjectOffsetX = parseFloat((lXAxis + (extrasX/2)).toFixed(6))
                // const newObjectOffsetY = lYAxis - objHeightMidpoint + (extrasY/2)
                // obj.style.top = `${newObjectOffsetY}px`;
                obj.style.left = `${newObjectOffsetX}px`;
                objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
                // objectData.current[obj.id].lastY = newObjectOffsetY
              }
              LCoordinateConnection(obj, line)
            }
          }

          

          // check if there's disconnection between the lines and the shape
            // isConnected doesn't mean that there's an active connection or valid connection
            // it just means that the line and the current shape (obj) are in contact or within range
            // it's not a check for validating a "from and to" of a line connection together..

          if (!isConnected) {

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
            if (tempCurrentLinePrevObjectId && !objectData.current[tempCurrentLinePrevObjectId]) {
              objectData.current[line.id].properties.prevObject.splice(0, 1)
              getCurrentLinePrevObjectId = null

              if (tempCurrentLineNextObjectId && objectData.current[tempCurrentLineNextObjectId]?.properties.prevObject.includes(tempCurrentLinePrevObjectId))  {
                const getIndex = objectData.current[tempCurrentLineNextObjectId].properties.prevObject.indexOf(tempCurrentLinePrevObjectId)
                objectData.current[tempCurrentLineNextObjectId].properties.prevObject.splice(getIndex, 1)
              }

            }


            // 1. disconnection from the lines M coordinates         
            
            if (getCurrentLinePrevObjectId === obj.id) {
              // remove current obj id as the line's prevObject 
              objectData.current[line.id].properties.prevObject.splice(0, 1)

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
            else if (getCurrentLineNextObjectId === obj.id) {
              // remove current obj id as the line's nextObject 
              objectData.current[line.id].properties.nextObject.splice(0, 1)

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
            
          }

          
      
          if (objectData.current[line.id].properties.nextObject[0] && objectData.current[line.id].properties.prevObject[0]) {
            // here's the check for a valid connection
            path!.setAttribute("stroke", "#4D4D4D")
            arrow.setAttribute("fill", "#4D4D4D")
          } else {
            path!.setAttribute("stroke", "#beb4b4")
            arrow.setAttribute("fill", "#beb4b4")
          }
      
        })
    }, [objectData,canvasRef, checkAndSetConnection, MCoordinateConnection, LCoordinateConnection])


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
            console.log("additon", (objOffsetLeft + (point as HTMLElement).offsetLeft))
        
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
     
      const objectDetails = objectData.current[object.id].properties.coordinates
      objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] = [pointX, pointY]
      point.style.left = `${pointX}px`
      point.style.top = `${pointY}px`

      const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
      const path = object.querySelector("svg.line-svg path")
      path?.setAttribute("d", coordString)
      // arrow
      const arrow = object.querySelector("svg.arrow-indicator")! as SVGElement

      let otherPoint: string, otherPointDetails: ["M"] | ["L", number, number?]
     
      if (pointDetails.length < 3 && pointID[0].next === null) {
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
        delete objectData.current[element.id]
        setIsEdited(true)
      }
    }, [objectData, setIsEdited])



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
        panelCoordinateXMarker.current = null
        panelCoordinateYMarker.current = null
        
      }
      if (onMouseDown.current) {
          // currentObject.current.classList.remove("current-object")
          const obj = currentObject.current
          if (currentActivePoint.current) {
            currentActivePoint.current.style.transform = "scale(1.0) translate(-50%, -50%)"
            LineConnector(obj, currentActivePoint.current)
            currentActivePoint.current = null

          } else {
            objectData.current[obj.id].properties.coordinates.lastX = parseFloat((obj?.offsetLeft as number).toFixed(6))
            objectData.current[obj.id].properties.coordinates.lastY = parseFloat((obj?.offsetTop as number).toFixed(6))
            objectData.current[obj.id].x_coordinate = parseFloat((obj?.offsetLeft as number).toFixed(6))
            objectData.current[obj.id].y_coordinate = parseFloat((obj?.offsetTop as number).toFixed(6))
            LineConnector(obj)
          }
          console.log(objectData.current)
          const tooltip = obj?.querySelector(".object-details-tooltip")

          tooltip?.classList.remove("show-tooltip")
          tooltip?.classList.add("hide-tooltip")
          
      }
      onMouseDown.current = false
      mouseMoved.current = false
    }, [LineConnector, objectData, setIsEdited])

    const handleMouseUpGeneral = useCallback((e: MouseEvent) => {
      // console.log('mouse up called in general ', onPanelResize.current, "mouse down", onMouseDown.current)
      handleMouseUpUtil()
    },[handleMouseUpUtil])
    

    const handleMouseDown = useCallback((e: MouseEvent, obj: HTMLElement) => {
      // console.log("event target", e.target)
      // console.log("obj", obj)
      if (obj.classList.contains("point-indicators")) {
          currentActivePoint.current = obj
          obj.style.transform = "scale(1.5) translate(-40%, -40%)"
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
      document.removeEventListener("mouseup", handleMouseUpGeneral)
      // console.log(e)
    }, [handleMouseUpGeneral, objectData])
    
    const handleMouseUp = useCallback((e: MouseEvent, obj?: HTMLElement) => {
      // console.log("called mouseup in mouseup !!!", onPanelResize.current, "mouse down", onMouseDown.current)
      if (onMouseDown.current || onPanelResize.current) {
        document.removeEventListener("mouseup", handleMouseUpGeneral)
      }
      handleMouseUpUtil()
      

      if (calculateBondsEnergy.current && obj){
        if (["Grinder", "Crusher"].includes(objectData.current[obj.id].object_info.object_model_name)) {
          communitionListForBondsEnergy.current.push(objectData.current[obj.id])
          if (communitionListForBondsEnergy.current.length >= 2) {
            console.log("calcuate bonds energy", communitionListForBondsEnergy.current)
            calculateBondsEnergy.current = false
            // Calculate it here
            calculateEnergyUsed()
          }
        }
      }

      
    }, [handleMouseUpGeneral, handleMouseUpUtil, objectData,calculateBondsEnergy, communitionListForBondsEnergy, calculateEnergyUsed])


    const createMultiplePoint = useCallback((e: MouseEvent, point: HTMLSpanElement) => {
      // Ability of a line to have multiple breakpoints on a line instead of just the regular straight line (That's why we are using the svg path element)
      const pointDetails = pointStore.current[point.id][1]

      if (pointDetails.length < 3) {
        const object = currentObject.current
        const newPoint = document.createElement("span")
        const newPointUid = "point-"+crypto.randomUUID()
        newPoint.classList.add("point-indicators")
        newPoint.setAttribute("id", newPointUid)
        newPoint.addEventListener("mousedown", (e)=> handleMouseDown(e, newPoint)) 
        newPoint.addEventListener("mouseup", handleMouseUp)
        newPoint.addEventListener("dblclick", e => createMultiplePoint(e, newPoint))
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

      }


    }, [handleMouseDown, handleMouseUp, objectData])



    const showPointVisibility = (e: FocusEvent | MouseEvent, element: HTMLElement) => {
      // on focus reveal each line breakpoints
      const indicators = element.querySelectorAll(".point-indicators")
      indicators.forEach(indicator => {
        indicator.classList.remove("hide-indicator")
      }) 
    }

    const hidePointVisibility = (e: FocusEvent, element: HTMLElement) => {
      // on focus out hide line breakpoints
      const indicators = element.querySelectorAll(".point-indicators")
      indicators.forEach(indicator => {
        indicator.classList.add("hide-indicator")
      }) 
    }

    const handleInput = useCallback((e: KeyboardEvent) => {
      const element = e.target as HTMLElement
      const parentElementContainer = element.closest(".text-object-container")!
      
      if (element.innerHTML!.length === 0 && e.keyCode === 8 && element.classList.contains("placeholder-style")) {
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





    const showObjectDetailsToolTip = useCallback((element: HTMLDivElement, tooltip: HTMLDivElement, dataId: string) => {
     
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
        tooltip.classList.remove("hide-tooltip")
     tooltip.classList.add("show-tooltip")
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

      
    }, [objectData])



    
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


        if (elementObjectType === "Shape" && elementObjectName === "Text") {
          // newEl.style.zIndex = "5"

          // defaultElementLabel = "Text"
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
        
        const textControlOptions = textControl.querySelector(".text-size-control-options")
        const controlOptionButton = textControl.querySelector(".open-control-options") as HTMLImageElement

        controlOptionButton?.addEventListener("click", (e)=> {

          if (textControlOptions?.classList.contains("text-size-control-options-show")) {
            textControlOptions?.classList.remove("text-size-control-options-show")
            controlOptionButton.src = arrowDown.src
          } else {
            textControlOptions?.classList.add("text-size-control-options-show")
            controlOptionButton.src = arrowUp.src
          }
          
        })
        textControlOptions?.querySelectorAll("span").forEach((span) => {
          span.addEventListener("click", () => {
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
          })
        })


          contentEditableDiv.setAttribute("data-variant", "text")
          contentEditableDiv.setAttribute("data-placeholder", "Text")
          contentEditableDiv.classList.add("shape-text-base-styles")
          contentEditableDiv.innerHTML = objectData.current[dataId].description
          if (contentEditableDiv.innerHTML!.length === 0)
            contentEditableDiv.classList.add("placeholder-style")


          textControl.addEventListener("mouseenter", (e)=> {
            objectData.current[newEl.id].textActive = true
          })
          textControl.addEventListener("mouseleave", (e)=> {
            objectData.current[newEl.id].textActive = false
          })
     
          
          contentEditableDiv.addEventListener("dblclick", (e) => handleDblClick(e, contentEditableDiv))


          contentEditableDiv.addEventListener("focusout", (e) => textFocusOut(newEl as HTMLDivElement, contentEditableDiv))
          newEl.addEventListener("focusout", (e) => textFocusOut(newEl as HTMLDivElement, contentEditableDiv))
          contentEditableDiv.addEventListener("keyup", handleInput)

        } else if (elementObjectType === "Shape" && elementObjectName === "Line") {
          // Lines 
          // newEl.style.zIndex = "5"
      
          newEl.setAttribute("data-variant", "line")
          newEl.classList.add("line-z-index")
          newEl.style.outline = "none"
          newEl.addEventListener("focus", (e)=> showPointVisibility(e, newEl))
          newEl.addEventListener("focusout", (e)=> hidePointVisibility(e, newEl))
          newEl.addEventListener("keyup", e=>handleShapeDelete(e, newEl))
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
            
          path!.addEventListener("dblclick", (e) => showPointVisibility(e, newEl))
       
          // path!.addEventListener("mouseover", (e)=> console.log("hover"))
          const pointAnchorUid = "point-"+crypto.randomUUID()
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
            const newPointUid = "point-"+crypto.randomUUID()
            newPoint.classList.add("point-indicators")
            newPoint.classList.add("hide-indicator")
            newPoint.setAttribute("id", newPointUid)
            newPoint.addEventListener("mousedown", (e)=> handleMouseDown(e, newPoint)) 
            newPoint.addEventListener("mouseup", handleMouseUp)
            newPoint.addEventListener("dblclick", e => createMultiplePoint(e, newPoint))
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
          const resizePanels = newEl.querySelectorAll(".resize-panel");
          resizePanels.forEach((panel) => {
            panel.addEventListener('mousedown', (e)=> {
              console.log(e, 'mousedown')
              onPanelResize.current = true
              currentPanel.current = panel as HTMLSpanElement
            })
      

          })
          newEl.addEventListener("focus", (e) => {
            (e.target as HTMLElement).style.outline = "2px solid #006644";
            resizePanels.forEach(panel=> {
              panel.classList.add('resize-panel-show')
            })
          })
          newEl.addEventListener("focusout", (e)=> {
            (e.target as HTMLElement).style.outline = "none";
            resizePanels.forEach(panel=> {
              panel.classList.remove('resize-panel-show')
            })
          })
          newEl.addEventListener("keyup", e=>handleShapeDelete(e, newEl))
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
       

        if (elementObjectName !== "Line") newEl.style.transform = `scale(${data.scale})`
        newEl.addEventListener("mousedown", (e) => handleMouseDown(e, newEl));
        newEl.addEventListener("mouseup", (e) => handleMouseUp(e, newEl));
        canvasRef.current.appendChild(newEl)
        objectLabels.current.add(data.label)
        if (data.properties.crusherType === "primary")
          primaryCrusherInUse.current = true

        if (elementObjectName !== "Text") {
          const tooltipWrapper = document.createElement("div")
          tooltipWrapper.classList.add('object-details-tooltip')
          tooltipWrapper.classList.add("hide-tooltip")
          newEl.appendChild(tooltipWrapper)
          newEl.addEventListener("mouseenter",(e)=> showObjectDetailsToolTip(newEl, tooltipWrapper, dataId))
          newEl.addEventListener("mouseleave", (e)=> {
            tooltipWrapper.classList.remove("show-tooltip")
            tooltipWrapper.classList.add("hide-tooltip")
            newEl.classList.remove('object-hover')
            if (newEl.id !== currentObject.current?.id)
              newEl.classList.remove("current-object")
          })
        } else {
          // Set font size and focus the active element on the right font size option
          newEl.style.fontSize = `${data.font_size}px`
          const textControlPanel = newEl.querySelector(".text-control-panel")!
          textControlPanel.querySelector(".selected-size-name")!.textContent = data.font_size === 12 ? "Small" : data.font_size === 14 ? "Medium" : "Large"
          textControlPanel.querySelector(`[data-size="${data.font_size}"]`)?.classList.add("text-selected")
        }

      }
    }, [createMultiplePoint, handleMouseDown, handleMouseUp, handleInput, handleShapeDelete, objectData, showObjectDetailsToolTip, canvasRef, textFocusOut])



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
      // console.log(newEl, "new el")
      // 
      // newEl.style.outline = "1px solid red"
      let x = e.clientX - canvasX - 30
      let y = e.clientY - canvasY - 30



      // Text
      if (elementObjectType === "Shape" && elementObjectName === "Text") {
        // newEl.style.zIndex = "5"
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
        
        const textControlOptions = textControl.querySelector(".text-size-control-options")
        const controlOptionButton = textControl.querySelector(".open-control-options") as HTMLImageElement

        controlOptionButton?.addEventListener("click", (e)=> {
          if (textControlOptions?.classList.contains("text-size-control-options-show")) {
            textControlOptions?.classList.remove("text-size-control-options-show")
            controlOptionButton.src = arrowDown.src
          } else {
            textControlOptions?.classList.add("text-size-control-options-show")
            controlOptionButton.src = arrowUp.src
          }
          
        })
        textControlOptions?.querySelectorAll("span").forEach((span) => {
          span.addEventListener("click", () => {
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

          })
        })



        
        contentEditableDiv.setAttribute("data-variant", "text")
        contentEditableDiv.setAttribute("data-placeholder", "Text")
        contentEditableDiv.classList.add("placeholder-style")
        contentEditableDiv.classList.add("shape-text-base-styles")


        textControl.addEventListener("mouseenter", (e)=> {
          objectData.current[newEl.id].textActive = true
        })
        textControl.addEventListener("mouseleave", (e)=> {
          objectData.current[newEl.id].textActive = false
        })
   
        contentEditableDiv.addEventListener("dblclick", (e) => handleDblClick(e, contentEditableDiv))


        contentEditableDiv.addEventListener("focusout", (e) => textFocusOut(newEl as HTMLDivElement, contentEditableDiv))
        newEl.addEventListener("focusout", (e) => textFocusOut(newEl as HTMLDivElement, contentEditableDiv))
        contentEditableDiv.addEventListener("keyup", handleInput)

      } else if (elementObjectType === "Shape" && elementObjectName === "Line") {
        // Lines 
        // newEl.style.zIndex = "5"
        newEl.setAttribute("data-variant", "line")
        newEl.classList.add("line-z-index")
        newEl.style.outline = "none"
        newEl.addEventListener("focus", (e)=> showPointVisibility(e, newEl))
        newEl.addEventListener("focusout", (e)=> hidePointVisibility(e, newEl))
        newEl.addEventListener("keyup", e=>handleShapeDelete(e, newEl))
        const lineWrapEl = newEl.querySelector(".line-wrap") as HTMLDivElement
        lineWrapEl.innerHTML = ""
        const lineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lineSvg.classList.add("overflow-visible")
        lineSvg.classList.add("line-svg")
        lineSvg.setAttribute("width", "30")
        lineSvg.setAttribute("height", "30")
        lineSvg.innerHTML = `
          <path d="M0 10 L30 10" fill="none" stroke="#beb4b4" strokeWidth="1.5"/>
        `
        lineWrapEl.appendChild(lineSvg)
        const path = lineSvg.querySelector("path")
        path!.addEventListener("dblclick", (e) => showPointVisibility(e, newEl))
        // path!.addEventListener("mouseover", (e)=> console.log("hover"))
        const point1Uid = "point-"+crypto.randomUUID()
        const point2Uid = "point-"+crypto.randomUUID()

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
        point2.addEventListener("mousedown", (e)=> handleMouseDown(e, point2)) 
        point2.addEventListener("mouseup", handleMouseUp)
        point2.addEventListener("dblclick", e => createMultiplePoint(e, point2))
        const startCoords: [number, number] = [15, 15]
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
        


        const lineCoordinates: lineCordsType  = {"M": startCoords, "L": [[50, 15]]}
        defaultCoords["lineCoordinates"] = lineCoordinates
        const coordString = LineCoordinateToPathString(lineCoordinates)
        path?.setAttribute("d", coordString)
        pointStore.current[point1Uid] = [{prev: null, next: point2Uid}, ["M"]]
        pointStore.current[point2Uid] = [{prev: point1Uid, next: null}, ["L", 0]]
        
      }else {
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
          panel.addEventListener('mousedown', (e)=> {
            console.log(e, 'mousedown')
            onPanelResize.current = true;
            currentPanel.current = panel as HTMLSpanElement
          })
       
        })
        newEl.addEventListener("focus", (e) => {
          (e.target as HTMLElement).style.outline = "2px solid #006644";
          resizePanels.forEach(panel=> {
            panel.classList.add('resize-panel-show')
          })
        })
        newEl.addEventListener("focusout", (e)=> {
          (e.target as HTMLElement).style.outline = "none";
          resizePanels.forEach(panel=> {
            panel.classList.remove('resize-panel-show')
          })
        })
        newEl.addEventListener("keyup", e=>handleShapeDelete(e, newEl))
      }
      const uuid4 = crypto.randomUUID()
      // newEl.style.border = "1px solid red"

      const defaultObjectData = {
          oid: uuid4,
          label: defaultElementLabel,
          x_coordinate: 0,
          y_coordinate: 0,
          scale: 1.25,
          font_size: 14,
          description: "",
          object_info: {
            object_model_name: elementObjectType,
            object_id: elementId
          },
          properties: {
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
      
      if (elementObjectName !== "Line") newEl.style.transform = "scale(1.25)"
      LineConnector(newEl)
      newEl.addEventListener("mousedown", (e) => handleMouseDown(e, newEl));
      newEl.addEventListener("mouseup", (e) => handleMouseUp(e, newEl));
      canvasRef.current.appendChild(newEl)

      if (elementObjectName !== "Text") {
        showObjectForm(x, y, elementObjectType, auxilliaryType)
        const tooltipWrapper = document.createElement("div")
        tooltipWrapper.classList.add('object-details-tooltip')
        tooltipWrapper.classList.add("hide-tooltip")
        newEl.appendChild(tooltipWrapper)
        newEl.addEventListener("mouseenter",(e)=> showObjectDetailsToolTip(newEl as HTMLDivElement, tooltipWrapper, uuid4))
        newEl.addEventListener("mouseleave", (e)=> {
          tooltipWrapper.classList.remove("show-tooltip")
          tooltipWrapper.classList.add("hide-tooltip")
          newEl.classList.remove('object-hover')
          if (newEl.id !== currentObject.current?.id)
            newEl.classList.remove("current-object")
        })
      } else {
          newEl.style.fontSize = `${defaultObjectData.font_size}px`
          setIsEdited(true)
      }
      prevActiveObject.current = currentObject.current
      currentObject.current = newEl
      

    }




    useEffect(()=> {
      const CanvasContainer = canvasRef.current
      const CanvasParentContainer = document.getElementById("canvas-parent-container")!
      const objects = document.querySelectorAll(".objects")
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
          
      const handleMouseMove = (e: MouseEvent) => {
        // console.log(e.clientY - CanvasContainer.offsetTop)
        if (onPanelResize.current) {
          const MAXSCALE = 3
          const panel = currentPanel.current
          const obj = currentObject.current
          const objData = objectData.current[obj.id]
          let currentScale = objData.scale
          let scaleOut = true;

          // const objectOffsetX = obj.offsetLeft
          // const objectOffsetY = obj.offsetTop
          // const objectOffsetYBottom = obj.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
          // const objectOffsetXRight = obj.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
          const cursorX = e.clientX - canvasRef.current.getBoundingClientRect().x
          const cursorY = e.clientY - canvasRef.current.getBoundingClientRect().y

          // console.log("cursor X", cursorX, panelCoordinateXMarker.current)
          // console.log("cursor Y", cursorY, panelCoordinateYMarker.current)
          if (panelCoordinateXMarker.current === null || panelCoordinateYMarker.current === null){
            panelCoordinateXMarker.current = cursorX
            panelCoordinateYMarker.current = cursorY
            return
          }



        

          // console.log("current scale", currentScale)
          if (panel.classList.contains('resize-panel-bl')) {
            if ((cursorX < panelCoordinateXMarker.current) && (cursorY > panelCoordinateYMarker.current)) scaleOut = true 
            else if ((cursorX > panelCoordinateXMarker.current) && (cursorY < panelCoordinateYMarker.current)) scaleOut = false
            else return
          }
          else if (panel.classList.contains('resize-panel-br')) {
            if ((cursorX > panelCoordinateXMarker.current) && (cursorY > panelCoordinateYMarker.current)) scaleOut = true 
            else if ((cursorX < panelCoordinateXMarker.current) && (cursorY < panelCoordinateYMarker.current)) scaleOut = false
            else return
          }
          else if (panel.classList.contains('resize-panel-tl')){
            if ((cursorX < panelCoordinateXMarker.current) && (cursorY < panelCoordinateYMarker.current)) scaleOut = true 
            else if ((cursorX > panelCoordinateXMarker.current) && (cursorY > panelCoordinateYMarker.current)) scaleOut = false
            else return
          }
          else if (panel.classList.contains('resize-panel-tr')) {
            if ((cursorX > panelCoordinateXMarker.current) && (cursorY < panelCoordinateYMarker.current)) scaleOut = true 
            else if ((cursorX < panelCoordinateXMarker.current) && (cursorY > panelCoordinateYMarker.current)) scaleOut = false
            else return
          }


          // console.log('scale out', scaleOut)
          if (scaleOut) {
            if (currentScale < MAXSCALE) 
              currentScale += 0.01
            else
              currentScale = MAXSCALE
            
            currentScale = parseFloat(currentScale.toFixed(3))
            obj.style.transform = `scale(${currentScale})`
            objData.scale = currentScale

          } else {
            if (currentScale > 1) 
              currentScale -= 0.01
            else 
              currentScale = 1

            currentScale = parseFloat(currentScale.toFixed(3))
            
            obj.style.transform = `scale(${currentScale})`
            objData.scale = currentScale
          }
          mouseMoved.current = true
          return;
        }

        if (onMouseDown.current) {
          mouseMoved.current = true
          if (currentActivePoint.current !== null) {
            DrawPoint(e, currentActivePoint.current)
          } else {
            const obj = currentObject.current as HTMLElement
            const objScale = objectData.current[obj.id].scale

            let offsetX = 10 
            let offsetY = 10 
            let offsetRight = canvasContainerContentWidth - 60
            let offsetBottom = canvasContainerContentHeight - 60
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
              const extrasX = shapeWidth - (shapeWidth / objScale) // in the case of scaled object we need to know how much they scaled by so we can subtract the excess while positioning our lines
              const extrasY = shapeHeight - (shapeHeight / objScale)
              offsetX = 10 + extrasX / 2
              offsetY = 10 + extrasY / 2
              offsetRight = canvasContainerContentWidth - (shapeWidth + extrasX / 4)
              offsetBottom = canvasContainerContentHeight - (shapeHeight + extrasY / 4)

            }
            const objectCoordinate = objectData.current[obj.id].properties.coordinates
            let nextX = e.clientX - objectCoordinate.startX + objectCoordinate.lastX
            let nextY = e.clientY - objectCoordinate.startY + objectCoordinate.lastY
            // console.log(nextX, "nextX")
            // console.log(offsetX, "offsetX")
          
            // console.log(nextX, canvasContainerContentWidth, "canvasContainerContentWidth")
            nextX = nextX < offsetX ? parseFloat(offsetX.toFixed(6)) : nextX > offsetRight ? parseFloat(offsetRight.toFixed(6)) : parseFloat(nextX.toFixed(6))
            nextY = nextY < offsetY ? parseFloat(offsetY.toFixed(6)) : nextY > offsetBottom ? parseFloat(offsetBottom.toFixed(6)): parseFloat(nextY.toFixed(6))
    

            // console.log(nextX, "nextX")

  
            
            // const containerBounds = CanvasParentContainer.getBoundingClientRect()
            // const currentElementBounds = obj.getBoundingClientRect()
            // const containerCenter = containerBounds.left + (containerBounds.width / 2)
            // const currentElementCenter = currentElementBounds.left + (currentElementBounds.width / 2)

            // if (currentElementBounds.right > containerBounds.right || currentElementBounds.left < containerBounds.left) {
            //   CanvasParentContainer.scrollLeft += (currentElementCenter + containerCenter)
            // }

            // Enable scrolling while dragging of the window to the right and bottom

            const parentContainerRight = CanvasParentContainer.getBoundingClientRect().right - CanvasParentContainer.getBoundingClientRect().x
            const parentContainerBottom = CanvasParentContainer.getBoundingClientRect().bottom - CanvasParentContainer.getBoundingClientRect().y
            const scrollNextX = nextX - CanvasParentContainer.scrollLeft
            const scrollNextY = nextY - CanvasParentContainer.scrollTop
            if (parentContainerRight - scrollNextX < 70) {
              // const difference = parentContainerRight - scrollNextX
              CanvasParentContainer.scrollLeft += 50
            }
            if (parentContainerBottom - scrollNextY < 70) {
              CanvasParentContainer.scrollTop += 50
            }
            // Enable scrolling while dragging back
            let scrollTop = CanvasParentContainer.scrollTop
            let scrollLeft = CanvasParentContainer.scrollLeft
          

            if (scrollLeft > 0 && nextX - scrollLeft < 30) {
              scrollLeft -= 20
              if (scrollLeft < 0) scrollLeft = 0
              CanvasParentContainer.scrollLeft = scrollLeft
            }
            if (scrollTop > 0 && nextY - scrollTop < 30) {
              scrollTop -= 20
              if (scrollTop < 0) scrollTop = 0
              CanvasParentContainer.scrollTop = scrollTop
            }

            // update the obj top and left css styles
            obj.style.top = `${nextY}px`
            obj.style.left = `${nextX}px`
            
          }
          
          
          
        }
        document.addEventListener("mouseup", handleMouseUpGeneral)
        // fix this 
        // document.addEventListener("click", ()=> console.log("document clicked"))
        // console.log(e)
      }
      // Main Project Canvas
      CanvasContainer.addEventListener("mousemove", handleMouseMove);
      CanvasContainer.addEventListener("mouseleave", handleMouseUp);
      CanvasContainer.addEventListener("mouseup", handleMouseUp)

      // Sidebar Canvas
      // SidebarCanvas.addEventListener("mousemove",)
      // SidebarCanvas.addEventListener("mouseleave")
      
      return () => {
        objects.forEach(object=> {
          (object as HTMLElement).removeEventListener("mousedown", (e) => handleMouseDown(e, object as HTMLElement));
          (object as HTMLElement).removeEventListener("mouseup", handleMouseUp);
          (object as HTMLElement).removeEventListener("focus", (e)=> (e.target as HTMLElement).style.outline = "2px solid #006644");
          (object as HTMLElement).removeEventListener("focusout", (e)=> (e.target as HTMLElement).style.outline = "none");
          (object as HTMLElement).removeEventListener("keyup", e=>handleShapeDelete(e, object as HTMLElement));
          // object.removeEventListener("mousemove", handleMouseMove)
        })
        document.querySelectorAll(".point-indicators").forEach(point => {
          (point as HTMLElement).removeEventListener("mousedown", (e)=> handleMouseDown(e, point as HTMLElement));
          (point as HTMLElement).removeEventListener("mouseup", handleMouseUp);
          (point as HTMLElement).addEventListener("dblclick", e => createMultiplePoint(e, point as HTMLElement))
        })
        CanvasContainer.removeEventListener("mousemove", handleMouseMove);
        CanvasContainer.removeEventListener("mouseleave", handleMouseUp);
        CanvasContainer.removeEventListener("mouseup", handleMouseUp)
        
      }
    }, [handleMouseDown,canvasRef, DrawPoint, handleMouseUpGeneral, params.flowsheet_id, params.project_id,setPageNotFound, pageNotFound, handleShapeDelete, setCanvasLoading, handleMouseUp,createMultiplePoint,  loadObjectToCanvas, objectData, hasInstance])

    useEffect(() => {
      let intervalRef: NodeJS.Timeout | null = null;
      if (flowsheetObject) {
        if (flowsheetObject.save_frequency_type === "AUTO" && flowsheetObject.save_frequency) {
          intervalRef = setInterval(()=> {    
              saveObjectData(params.flowsheet_id)
            
          }, Number(flowsheetObject.save_frequency) * 1000)
        }
        
      }
      return (()=> {
        if (intervalRef) clearInterval(intervalRef)
      })
    }, [flowsheetObject, params.flowsheet_id, saveObjectData])

    useEffect(() => {
      const browserCloseWarning = (e: BeforeUnloadEvent) => {
        if (isEdited) {
          e.preventDefault()
          e.returnValue = "";
        }
      }
      window.addEventListener('beforeunload', browserCloseWarning)
      return () => {
        window.removeEventListener('beforeunload', browserCloseWarning)
      }
    },[isEdited])

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

              <div className="relative overflow-hidden canvas-bg small-grid-bg w-[10000px] h-[10000px]">

                <div className="relative overflow-hidden z-1 canvas-bg large-grid-bg w-[10000px] h-[10000px]">
                  <div onDragOver={isOpened ? (e)=>false :  (e)=> e.preventDefault()} className="relative z-2 cursor-move overflow-hidden w-full h-full opacity-2" ref={canvasRef} onDrop={handleDrop} >
                      { 
                        isOpened &&<ObjectForm formFields={formFields} position={objectFormPosition} handleFormState={handleFormState} saveForm={handleFormSave} closeFormUnsaved={closeFormUnsaved} formState={formState as formStateObjectType} objectFormType={objectFormType.current}/>
                      }
                    </div>
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
"use client";
import { useEffect, useState, useRef, useCallback, DragEvent, ChangeEvent, FormEvent} from "react";
import ObjectForm from "./ObjectForm";


type lineCordsType = {
  M: [number, number], 
  L: [number, number][]
}
type objectCoords = {
  startX: number, 
  startY: number, 
  lastX: number, 
  lastY: number,
  lineCoordinates?: lineCordsType
}


type objectDataType = {
  [key: string]: {
    oid: string,
    label: string,
    x_coordinate: number,
    y_coordinate: number,
    scale: number,
    font_size: number,
    description: string,
    object_info: {
      object_model_name: string,
      object_id: string
    }
  
    properties: {
      nextObject: string | null,
      prevObject: string | null,
      coordinates: objectCoords
    }
  }
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



const Canvas = () => {
    const [isOpened, setIsOpened] = useState<boolean>(false)
    const canvasRef = useRef<HTMLDivElement>(null!)
    const currentObject = useRef<HTMLElement>(null!)
    const objectData = useRef<objectDataType>({})
    const pointStore = useRef<{[key: string]: ["M"] | ["L", number, number?]}>({})
    const currentActivePoint = useRef<HTMLSpanElement | null>(null)
    const onMouseDown = useRef(false)
    const [objectFormPosition, setObjectFormPosition] = useState<{x: number, y: number}>({x: 20, y: 20})
    const objectLabels = useRef(new Set<string>())
    const [formFields, setFormFields] = useState<{type:string, name: string, verboseName: string, htmlType: string}[]>([
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
    ])
    const [formState, setFormState] = useState<{[key: string]: string} | null>(null)



    const updateObjectData = () => {
      const object = currentObject.current
      objectData.current[object.id].label = formState!.label.trim().toLowerCase()
      objectLabels.current.add(formState!.label.trim().toLowerCase())
      objectData.current[object.id].description = formState!.description
    }

    const handleFormState = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     setFormState(prevState => {
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
      updateObjectData()
      setFormState(null)
      setIsOpened(false)
    }


    const showObjectForm = (x: number, y: number) => {
      setIsOpened(true)
      setObjectFormPosition({x, y})
      setFormState({
        label: "",
        description: ""
      })
    }



    const DrawLineToShape = useCallback((obj: HTMLElement, point: HTMLSpanElement) => {
      for (const shapeId in objectData.current) {
        if (obj.id === shapeId) 
          continue
        const shape = document.getElementById(shapeId) as HTMLElement;
        if (!shape) continue
        if (shape.getAttribute("data-variant") === "text")
          continue

        const pointMetadata = pointStore.current[point.id]
        if (pointMetadata[0] === "M") continue // Not likely possible but we still check
        if (pointMetadata.length > 2) continue // Must be the last point

        const shapeOffsetX = shape.offsetLeft
        const shapeOffsetY = shape.offsetTop
        const shapeOffsetYBottom = shape.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
        const shapeOffsetXRight = shape.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
        const shapeWidth =  shape.getBoundingClientRect().width
        const shapeHeight =  shape.getBoundingClientRect().height

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


        // scenario 1: Drawing from the top:
        if (lYAxis === shapeOffsetY || Math.abs(lYAxis - shapeOffsetY) <= 10) {

          if (lXAxis >= shapeOffsetX && lXAxis <= shapeOffsetXRight) {
            // Ensure the point is within the box range on x axis
            const pointGap = shapeOffsetY - lYAxis           
            coordinates.L[coordinates.L.length - 1][1] = L[1] + pointGap - (extrasY/2)
            const pathDString = LineCoordinateToPathString(coordinates)
            const path = obj.querySelector("svg path")
            point.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
            path?.setAttribute("d", pathDString)



            objectData.current[obj.id].properties.nextObject = shapeId
            objectData.current[shapeId].properties.prevObject = objectData.current[obj.id].properties.prevObject
          }
        }

        // scenario 2: Drawing from the bottom
        if (lYAxis === shapeOffsetYBottom || Math.abs(lYAxis - shapeOffsetYBottom) <= 10) {
          if (lXAxis >= shapeOffsetX && lXAxis <= shapeOffsetXRight) {
            // Ensure the point is within the box range on x axis
            const pointGap = shapeOffsetYBottom - lYAxis
            coordinates.L[coordinates.L.length - 1][1] = L[1] + pointGap
            const pathDString = LineCoordinateToPathString(coordinates)
            const path = obj.querySelector("svg path")
            point.style.top = `${coordinates.L[coordinates.L.length - 1][1]}px`
            path?.setAttribute("d", pathDString)


            objectData.current[obj.id].properties.nextObject = shapeId
            objectData.current[shapeId].properties.prevObject = objectData.current[obj.id].properties.prevObject
          }
        }

        // scenario 3: Drawing from the right

        if (lXAxis === shapeOffsetXRight || Math.abs(lXAxis - shapeOffsetXRight) <= 10) {
          if (lYAxis >= shapeOffsetY && lYAxis <= shapeOffsetYBottom) {
            // Ensure the point is within the box range on y axis
            const pointGap = shapeOffsetXRight - lXAxis
            coordinates.L[coordinates.L.length - 1][0] = L[0] + pointGap
            const pathDString = LineCoordinateToPathString(coordinates)
            const path = obj.querySelector("svg path")
            point.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
            path?.setAttribute("d", pathDString)


            objectData.current[obj.id].properties.nextObject = shapeId
            objectData.current[shapeId].properties.prevObject = objectData.current[obj.id].properties.prevObject
          }
        }

        // scenario 4: Drawing from the left

        if (lXAxis === shapeOffsetX || Math.abs(lXAxis - shapeOffsetX) <= 10) {
          if (lYAxis >= shapeOffsetY && lYAxis <= shapeOffsetYBottom) {
            // Ensure the point is within the box range on y axis
            const pointGap = shapeOffsetX - lXAxis
            coordinates.L[coordinates.L.length - 1][0] = L[0] + pointGap - (extrasX / 2)
            const pathDString = LineCoordinateToPathString(coordinates)
            const path = obj.querySelector("svg path")
            point.style.left = `${coordinates.L[coordinates.L.length - 1][0]}px`
            path?.setAttribute("d", pathDString)


            objectData.current[obj.id].properties.nextObject = shapeId
            objectData.current[shapeId].properties.prevObject = objectData.current[obj.id].properties.prevObject
          }
        }
      }
    }, [])

    

    const LineToShape = (obj: HTMLElement) => {
      for (const shapeId in objectData.current) {
        if (obj.id === shapeId)
          continue
        const shape = document.getElementById(shapeId) as HTMLElement;
        if (!shape) continue
        if (shape.getAttribute("data-variant") === "text" || shape.getAttribute("data-variant") === "line")
          continue
        const shapeOffsetX = shape.offsetLeft
        const shapeOffsetY = shape.offsetTop
        const shapeOffsetYBottom = shape.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
        const shapeOffsetXRight = shape.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x
        const shapeWidth =  shape.getBoundingClientRect().width
        const shapeHeight =  shape.getBoundingClientRect().height

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

        

        if (shapeOffsetYBottom === mYAxis || Math.abs(shapeOffsetYBottom - mYAxis) < 10) {
          // Dragging the line in from the bottom (M coordinates)
          if (mXAxis >= shapeOffsetX && mXAxis <= shapeOffsetXRight) {
            // const shapeWidthMidpoint = shapeWidth / 2
            // const newLineOffsetX = shapeOffsetX + shapeWidthMidpoint - M[0] - (extrasX/2)
            const newLineOffsetY = shapeOffsetYBottom - M[1]
           
            obj.style.top = `${newLineOffsetY}px`;
            // obj.style.left = `${newLineOffsetX}px`;
            // objectData.current[obj.id].lastX = newLineOffsetX
            objectData.current[obj.id].properties.coordinates.lastY = newLineOffsetY


            // Setting the line previous attribute
            objectData.current[obj.id].properties.prevObject = shapeId

            // setting the current shape next object to the line next object
            objectData.current[shapeId].properties.nextObject = objectData.current[obj.id].properties.nextObject
          }
        }

        if (shapeOffsetY === lYAxis || Math.abs(shapeOffsetY - lYAxis) < 10) {
          // Dragging the line in from the top (L coordinates)
          if (lXAxis >= shapeOffsetX && lXAxis <= shapeOffsetXRight) {
            // const shapeWidthMidpoint = shapeWidth / 2
            // const newLineOffsetX = shapeOffsetX + shapeWidthMidpoint - L[0] - (extrasX/2)
            const newLineOffsetY = shapeOffsetY - L[1] - M[1]
            // console.log(mYAxis, "myaxis")
            if (newLineOffsetY < 6)
              return
            obj.style.top = `${newLineOffsetY}px`;
            // obj.style.left = `${newLineOffsetX}px`;
            // objectData.current[obj.id].lastX = newLineOffsetX
            objectData.current[obj.id].properties.coordinates.lastY = newLineOffsetY




            // setting the line/object next object to the current shape id(could be any object)
            objectData.current[obj.id].properties.nextObject = shapeId

            // setting the shape previous attribute to the line previous object

            objectData.current[shapeId].properties.prevObject =  objectData.current[obj.id].properties.prevObject
            
          }
        }


        if (shapeOffsetX === mXAxis || Math.abs(shapeOffsetX - mXAxis) < 10) {
          // Dragging the line in from the left (for M coordinates)
          if (mYAxis >= shapeOffsetY && mYAxis <= shapeOffsetYBottom) {
            // const shapeHeightMidpoint = shapeHeight / 2
            const newLineOffsetX = shapeOffsetX - M[0] - (extrasX/2)
            // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - M[1] - (extrasY/2)
            if (newLineOffsetX < 6)
              return
            // obj.style.top = `${newLineOffsetY}px`;
            obj.style.left = `${newLineOffsetX}px`;
            objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
            // objectData.current[obj.id].lastY = newLineOffsetY


            
            // Setting the line previous attribute
            objectData.current[obj.id].properties.prevObject = shapeId

            // setting the current shape next object to the line next object
            objectData.current[shapeId].properties.nextObject = objectData.current[obj.id].properties.nextObject

          }
        }

        if (shapeOffsetXRight === mXAxis || Math.abs(shapeOffsetXRight - mXAxis) < 10) {
          // Dragging the line in from the right (for M coordinates)
          if (mYAxis >= shapeOffsetY && mYAxis <= shapeOffsetYBottom) {
            // const shapeHeightMidpoint = shapeHeight / 2
            const newLineOffsetX = shapeOffsetXRight - M[0] 
            // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - M[1] - (extrasY/2)
            // obj.style.top = `${newLineOffsetY}px`;
            obj.style.left = `${newLineOffsetX}px`;
            objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
            // objectData.current[obj.id].lastY = newLineOffsetY


            
            // Setting the line previous attribute
            objectData.current[obj.id].properties.prevObject = shapeId

            // setting the current shape next object to the line next object
            objectData.current[shapeId].properties.nextObject = objectData.current[obj.id].properties.nextObject
          }
        }

        if (shapeOffsetX === lXAxis || Math.abs(shapeOffsetX - lXAxis) < 10) {
          // Dragging the line in from the left (for L coordinates)
          if (lYAxis >= shapeOffsetY && lYAxis <= shapeOffsetYBottom) {
            // const shapeHeightMidpoint = shapeHeight / 2
            const newLineOffsetX = shapeOffsetX - L[0] - (extrasX/2)
            // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - L[1] - (extrasY/2)
            if (newLineOffsetX < 6)
              return
            // obj.style.top = `${newLineOffsetY}px`;
            obj.style.left = `${newLineOffsetX}px`;
            objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
            // objectData.current[obj.id].lastY = newLineOffsetY



            // setting the line/object next object to the current shape id(could be any object)
            objectData.current[obj.id].properties.nextObject = shapeId

            // setting the shape previous attribute to the line previous object

            objectData.current[shapeId].properties.prevObject =  objectData.current[obj.id].properties.prevObject
          }
        }

        if (shapeOffsetXRight === lXAxis || Math.abs(shapeOffsetXRight - lXAxis) < 10) {
          // Dragging the line in from the right (for L coordinates)
          if (lYAxis >= shapeOffsetY && lYAxis <= shapeOffsetYBottom) {
            // const shapeHeightMidpoint = shapeHeight / 2
            const newLineOffsetX = shapeOffsetXRight - L[0]
            // const newLineOffsetY = shapeOffsetY + shapeHeightMidpoint - L[1] - (extrasY/2)
            // obj.style.top = `${newLineOffsetY}px`;
            obj.style.left = `${newLineOffsetX}px`;
            objectData.current[obj.id].properties.coordinates.lastX = newLineOffsetX
            // objectData.current[obj.id].lastY = newLineOffsetY
            

            // setting the line/object next object to the current shape id(could be any object)
            objectData.current[obj.id].properties.nextObject = shapeId

            // setting the shape previous attribute to the line previous object

            objectData.current[shapeId].properties.prevObject =  objectData.current[obj.id].properties.prevObject
          }
        }

      }
    }


    const ShapeToLine = (obj: HTMLElement) => {
        // Get all the lines
        const lines = document.querySelectorAll("[data-variant=line]")
        lines.forEach(line => {
          // For each line check if the currentObject been dragged/move is in contact with the any line or with 5px range
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

          // Getting the scale of the shape
          const scale = +getComputedStyle(obj).transform.replace("matrix(", "").split(",")[0].trim() // Since scale x,y would be the same
          const extrasX = objectWidth - (objectWidth / scale) // in the case of scaled object we need to know how much they scaled by so we can subtract the excess while positioning our lines
          const extrasY = objectHeight - (objectHeight / scale)
         
          if (objectOffsetYBottom === mYAxis || Math.abs(objectOffsetYBottom - mYAxis) < 10) {
            // Dragging the object in from the top (M coordinates)
            if (mXAxis >= objectOffsetX && mXAxis <= objectOffsetXRight) {
              // const objWidthMidpoint = objectWidth / 2
              // const newObjectOffsetX = mXAxis - objWidthMidpoint + (extrasX/2)
              const newObjectOffsetY = mYAxis - objectHeight + (extrasY/2)
              // console.log(mYAxis, "myaxis")
              if (newObjectOffsetY < 6)
                return
              obj.style.top = `${newObjectOffsetY}px`;
              // obj.style.left = `${newObjectOffsetX}px`;
              // objectData.current[obj.id].lastX = newObjectOffsetX
              objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY

              // setting the line previous object attribute
              objectData.current[line.id].properties.prevObject = obj.id

              // setting the current object to the line next object attribute
              objectData.current[obj.id].properties.nextObject = objectData.current[line.id].properties.nextObject

            }
          }

          if (objectOffsetY === lYAxis || Math.abs(objectOffsetY - lYAxis) < 10) {
            // Dragging the object in from bottom (L coordinates)
            if (lXAxis >= objectOffsetX && lXAxis <= objectOffsetXRight) {
              // const objWidthMidpoint = objectWidth / 2
              // const newObjectOffsetX = lXAxis - objWidthMidpoint + (extrasX/2)
              const newObjectOffsetY = lYAxis + (extrasY/2)
              // console.log(mYAxis, "myaxis")

              obj.style.top = `${newObjectOffsetY}px`;
              // obj.style.left = `${newObjectOffsetX}px`;
              // objectData.current[obj.id].lastX = newObjectOffsetX
              objectData.current[obj.id].properties.coordinates.lastY = newObjectOffsetY

              // setting the line next object attribute
              objectData.current[line.id].properties.nextObject = obj.id

              // setting the current object previous object to the line  previous object attribute
              objectData.current[obj.id].properties.prevObject = objectData.current[line.id].properties.prevObject
            }
          }
         
          if (objectOffsetXRight === mXAxis || Math.abs(objectOffsetXRight - mXAxis) < 10) {
            // Dragging the object in from the left (for M coordinates)
            if (mYAxis >= objectOffsetY && mYAxis <= objectOffsetYBottom) {
              // const objHeightMidpoint = objectHeight / 2
              const newObjectOffsetX = mXAxis - objectWidth + (extrasX/2)
              // const newObjectOffsetY = mYAxis - objHeightMidpoint + (extrasY/2)
              if (newObjectOffsetX < 6)
                return
              // obj.style.top = `${newObjectOffsetY}px`;
              obj.style.left = `${newObjectOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
              // objectData.current[obj.id].lastY = newObjectOffsetY


              
              // setting the line previous object attribute
              objectData.current[line.id].properties.prevObject = obj.id

              // setting the current object to the line next object attribute
              objectData.current[obj.id].properties.nextObject = objectData.current[line.id].properties.nextObject

            }
          }
          
          if (objectOffsetX === mXAxis || Math.abs(objectOffsetX - mXAxis) < 10) {
            // Dragging the object in from the right (for M coordinates)
            if (mYAxis >= objectOffsetY && mYAxis <= objectOffsetYBottom) {
              // const objHeightMidpoint = objectHeight / 2
              const newObjectOffsetX = mXAxis + (extrasX/2)
              // const newObjectOffsetY = mYAxis - objHeightMidpoint + (extrasY/2)
              // obj.style.top = `${newObjectOffsetY}px`;
              obj.style.left = `${newObjectOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
              // objectData.current[obj.id].lastY = newObjectOffsetY


               
              // setting the line previous object attribute
              objectData.current[line.id].properties.prevObject = obj.id

              // setting the current object to the line next object attribute
              objectData.current[obj.id].properties.nextObject = objectData.current[line.id].properties.nextObject

            }
          }

          if (objectOffsetXRight === lXAxis || Math.abs(objectOffsetXRight - lXAxis) < 10) {
            // Dragging the object in from the left (for L coordinates)
            if (lYAxis >= objectOffsetY && lYAxis <= objectOffsetYBottom) {
              // const objHeightMidpoint = objectHeight / 2
              const newObjectOffsetX = lXAxis - objectWidth + (extrasX/2)
              // const newObjectOffsetY = lYAxis - objHeightMidpoint + (extrasY/2)
              if (newObjectOffsetX < 6)
                return
              // obj.style.top = `${newObjectOffsetY}px`;
              obj.style.left = `${newObjectOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
              // objectData.current[obj.id].lastY = newObjectOffsetY


               // setting the line next object attribute
               objectData.current[line.id].properties.nextObject = obj.id

               // setting the current object previous object to the line  previous object attribute
               objectData.current[obj.id].properties.prevObject = objectData.current[line.id].properties.prevObject

            }
          }
          if (objectOffsetX === lXAxis || Math.abs(objectOffsetX - lXAxis) < 10) {
            // Dragging the object in from the right (for L coordinates)
            if (lYAxis >= objectOffsetY && lYAxis <= objectOffsetYBottom) {
              // const objHeightMidpoint = objectHeight / 2
              const newObjectOffsetX = lXAxis + (extrasX/2)
              // const newObjectOffsetY = lYAxis - objHeightMidpoint + (extrasY/2)
              // obj.style.top = `${newObjectOffsetY}px`;
              obj.style.left = `${newObjectOffsetX}px`;
              objectData.current[obj.id].properties.coordinates.lastX = newObjectOffsetX
              // objectData.current[obj.id].lastY = newObjectOffsetY



               // setting the line next object attribute
               objectData.current[line.id].properties.nextObject = obj.id

               // setting the current object previous object to the line  previous object attribute
               objectData.current[obj.id].properties.prevObject = objectData.current[line.id].properties.prevObject

            }
          }
      
        })
    }


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
      
      
    }, [DrawLineToShape])

    const checkLineBoundary = (e: MouseEvent, obj: HTMLElement) => {
      const pointIndicators = obj.querySelectorAll(".point-indicators")
      const coords: {offsetLeft: number, offsetTop: number} = {offsetLeft: 0, offsetTop: 0}
      const pointIndicatorArray = Array.from(pointIndicators)
      const objOffsetLeft = obj.offsetLeft
      const objOffsetTop = obj.offsetTop
      for (const point of pointIndicatorArray) {
        if ((objOffsetLeft + (point as HTMLElement).offsetLeft) < 7 || (objOffsetTop + (point as HTMLElement).offsetTop) < 7) {
          // 7 here is arbitrary for padding
          if ((objOffsetLeft + (point as HTMLElement).offsetLeft) < 7)
            coords.offsetLeft = Math.abs((point as HTMLElement).offsetLeft) + 6
          if ((objOffsetTop + (point as HTMLElement).offsetTop) < 7)
            coords.offsetTop = Math.abs((point as HTMLElement).offsetTop) + 6
        }
      }
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

 

    const DrawPoint = useCallback((e: MouseEvent, point: HTMLElement) => {
      // const 
      const containerX = canvasRef.current.getBoundingClientRect().x
      const containerY = canvasRef.current.getBoundingClientRect().y
      if ((e.clientX - containerX) < 7 || (e.clientY - containerY) < 7) {
        return
      }
      const object = currentObject.current
      const objectX = object.getBoundingClientRect().x
      const objectY = object.getBoundingClientRect().y
      const pointX = e.clientX - objectX 
      const pointY = e.clientY - objectY
      const pointDetails = pointStore.current[point.id] // point here is expected to be ["L", :any number]
      const objectDetails = objectData.current[object.id].properties.coordinates
      objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] = [pointX, pointY]
      point.style.left = `${pointX}px`
      point.style.top = `${pointY}px`
      const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
      const path = object.querySelector("svg path")
      path?.setAttribute("d", coordString)
      // 
    }, [])



    const handleShapeDelete = (e: KeyboardEvent, element: HTMLElement) => {
      if (e.keyCode === 8 || e.keyCode === 46) {
        element.remove()
        // Send a delete request to the backend to update the delete (if already created by check if there is an id field)
        delete objectData.current[element.id]
      }
    }



    const handleDblClick = (e: MouseEvent, element: HTMLElement) => {
      element.setAttribute("contenteditable", "true")
      element.style.border = "1px solid black"
    }



    const handleMouseUpUtil = useCallback(() => {
      if (onMouseDown.current) {
        const obj = currentObject.current

          if (currentActivePoint.current) {
            currentActivePoint.current.style.transform = "scale(1.0) translate(-50%, -50%)"
            LineConnector(obj, currentActivePoint.current)
            currentActivePoint.current = null

          } else {
            objectData.current[obj.id].properties.coordinates.lastX = obj?.offsetLeft as number
            objectData.current[obj.id].properties.coordinates.lastY = obj?.offsetTop as number
            objectData.current[obj.id].x_coordinate = obj?.offsetLeft as number
            objectData.current[obj.id].y_coordinate = obj?.offsetTop as number
            LineConnector(obj)
          }
          
      }
      onMouseDown.current = false
    }, [LineConnector])

    const handleMouseUpGeneral = useCallback((e: MouseEvent) => {
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
          currentObject.current = obj
          objectData.current[obj.id].properties.coordinates.startX = e.clientX
          objectData.current[obj.id].properties.coordinates.startY = e.clientY
      }
      onMouseDown.current = true
      document.removeEventListener("mouseup", handleMouseUpGeneral)
      // console.log(e)
    }, [handleMouseUpGeneral])
    
    const handleMouseUp = useCallback((e: MouseEvent, obj?: HTMLElement) => {
      if (onMouseDown.current) {
        handleMouseUpUtil()
        console.log(objectData.current)
        document.removeEventListener("mouseup", handleMouseUpGeneral)
      }
      
    }, [handleMouseUpGeneral, handleMouseUpUtil])


    const createMultiplePoint = useCallback((e: MouseEvent, point: HTMLSpanElement) => {
      // Ability of a line to have multiple breakpoints instead of just the regular straight line (That's why we are using the svg path element)
      const pointDetails = pointStore.current[point.id]

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
        const path = object.querySelector("svg path")


        // update the pointStore.current for point.id to show there is a third point

        pointStore.current[point.id][2] = pointDetails[1]! + 1

        // create a new pointStore.current for  newPoint
        pointStore.current[newPointUid] = ["L", pointStore.current[point.id][2]!]

        // update line coordinates
        const newPointDetails = pointStore.current[newPointUid]
        const objectDetails = objectData.current[object.id].properties.coordinates
        objectDetails.lineCoordinates![newPointDetails[0]][newPointDetails[1]!] = objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] as [number, number]
        const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
        path?.setAttribute("d", coordString)

      }


    }, [handleMouseDown, handleMouseUp])



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

    const handleInput = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement

      if (element.textContent!.length === 0 && e.keyCode === 8 && element.classList.contains("placeholder-style")) {
        element.remove()
        // Send a delete request to the backend to update the delete (if already created by check if there is an id field)
        delete objectData.current[element.id]
      }
      
      if (element.textContent!.length > 0) element.classList.remove("placeholder-style")
      else element.classList.add("placeholder-style")

      
      
    }
  
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {

      let defaultCoords: objectCoords = {
        startX: 0, 
        startY: 0, 
        lastX: 0, 
        lastY: 0,
        
      }
      const elementId = e.dataTransfer?.getData("elementId");
      if (!elementId) return
      const element = document.getElementById(elementId as string)
      if (!element) return
      const elementObjectType = element.getAttribute("data-object-type")! // Shape, Grinder, Crusher
      const elementObjectName = element.getAttribute("data-object-name") || null //circle, text etc...
      const newEl = element.cloneNode(true) as HTMLElement
      const canvasX = canvasRef.current.getBoundingClientRect().x
      const canvasY = canvasRef.current.getBoundingClientRect().y
      newEl.setAttribute("tabindex", "-1")
      element.removeAttribute("data-object-type")
      element.removeAttribute("data-object-name")
      // 
      // newEl.style.outline = "1px solid red"
      let x = e.clientX - canvasX - 30
      let y = e.clientY - canvasY - 30



      // Text
      if (elementObjectType === "Shape" && elementObjectName === "text") {
        newEl.classList.remove('text-2xl')
        newEl.setAttribute("data-variant", "text")
        newEl.setAttribute("data-placeholder", "Text")
        newEl.classList.add("placeholder-style")
        newEl.classList.add("shape-text-base-styles")
        newEl.textContent = ""
        newEl.addEventListener("dblclick", (e) => handleDblClick(e, newEl))
        newEl.addEventListener("focusout", ()=>{
          newEl.removeAttribute("contenteditable")
          newEl.style.color = "black"
          newEl.style.border = "none"
        })
        newEl.addEventListener("keyup", handleInput)
      } else if (elementObjectType === "Shape" && elementObjectName === "line") {
        // Lines 
        newEl.setAttribute("data-variant", "line")
        newEl.style.width = "30px"
        newEl.style.height = "50px"
        newEl.style.outline = "none"
        newEl.addEventListener("focus", (e)=> showPointVisibility(e, newEl))
        newEl.addEventListener("focusout", (e)=> hidePointVisibility(e, newEl))
        newEl.addEventListener("keyup", e=>handleShapeDelete(e, newEl))
        const lineWrapEl = newEl.querySelector(".line-wrap") as HTMLDivElement
        const svg = newEl.querySelector("svg")
        const path = svg!.querySelector("path")
        path!.addEventListener("dblclick", (e) => showPointVisibility(e, newEl))
        const point1Uid = "point-"+crypto.randomUUID()
        const point2Uid = "point-"+crypto.randomUUID()

        const point1 = document.createElement("span") // Starting point which doesn't change
        const point2 = document.createElement("span")
        point1.classList.add("point-indicators")
        point2.classList.add("point-indicators")
        point1.classList.add("hide-indicator")
        point2.classList.add("hide-indicator")
        point1.setAttribute("id", point1Uid)
        point2.setAttribute("id", point2Uid)
        point2.addEventListener("mousedown", (e)=> handleMouseDown(e, point2)) 
        point2.addEventListener("mouseup", handleMouseUp)
        point2.addEventListener("dblclick", e => createMultiplePoint(e, point2))
        const startCoords: [number, number] = [15, 5]
        point1.style.top = `${startCoords[1]}px`
        point1.style.left = `${startCoords[0]}px`
        point2.style.left = `${startCoords[0]}px`
        point2.style.top = "100px"
        lineWrapEl.appendChild(point1)
        lineWrapEl.appendChild(point2)
        const lineCoordinates: lineCordsType  = {"M": startCoords, "L": [[15, 100]]}
        defaultCoords["lineCoordinates"] = lineCoordinates
        const coordString = LineCoordinateToPathString(lineCoordinates)
        path?.setAttribute("d", coordString)
        pointStore.current[point1Uid] = ["M"]
        pointStore.current[point2Uid] = ["L", 0]
        
      }else {
        newEl.addEventListener("focus", (e)=> (e.target as HTMLElement).style.outline = "2px solid #7c7c06")
        newEl.addEventListener("focusout", (e)=> (e.target as HTMLElement).style.outline = "none")
        newEl.addEventListener("keyup", e=>handleShapeDelete(e, newEl))
      }
      const uuid4 = crypto.randomUUID()
      const defaultObjectData = {
          oid: uuid4,
          label: "",
          x_coordinate: 0,
          y_coordinate: 0,
          scale: 1.25,
          font_size: 14.4,
          description: "",
          object_info: {
            object_model_name: elementObjectType,
            object_id: elementId
          },
          properties: {
            nextObject: null,
            prevObject: null,
            coordinates: defaultCoords
          }
      }
      console.log('object data', defaultObjectData)
      newEl.setAttribute("id", uuid4)
      newEl.removeAttribute("draggable")
      newEl.classList.add("absolute")
      newEl.classList.add("cursor-move")
      newEl.classList.remove("cursor-grabbing")
      x = x < 6 ? 6 : x
      y = y < 6 ? 6 : y
      
      objectData.current[uuid4] = defaultObjectData
      objectData.current[uuid4].properties.coordinates.lastX = x
      objectData.current[uuid4].properties.coordinates.lastY = y
      objectData.current[uuid4].x_coordinate = x
      objectData.current[uuid4].y_coordinate = y
      newEl.style.top = `${y}px`
      newEl.style.left = `${x}px`
      if (elementObjectName !== "line") newEl.style.transform = "scale(1.25)"
      LineConnector(newEl)
      newEl.addEventListener("mousedown", (e) => handleMouseDown(e, newEl));
      newEl.addEventListener("mouseup", handleMouseUp);
      canvasRef.current.appendChild(newEl)

      currentObject.current = newEl
      if (elementObjectName !== "text") showObjectForm(x, y)

    }




    useEffect(()=> {
      const CanvasContainer = canvasRef.current
      const objects = document.querySelectorAll(".objects")
      // console.log(objects)
    
  
      
      const handleMouseMove = (e: MouseEvent) => {
        if (onMouseDown.current) {
          if (currentActivePoint.current !== null) {
            DrawPoint(e, currentActivePoint.current)
          } else {
            const obj = currentObject.current as HTMLElement
            let offsetX = 10
            let offsetY = 10
            if (obj.getAttribute("data-variant") === "line") {
              // To prevent Lines from going over the edge
              const {offsetLeft, offsetTop} = checkLineBoundary(e, obj)
            
              offsetX = offsetLeft > offsetX ? offsetLeft : offsetX
              offsetY = offsetTop > offsetY ? offsetTop : offsetY
            }
            const objectCoordinate = objectData.current[obj.id].properties.coordinates
            let nextX = e.clientX - objectCoordinate.startX + objectCoordinate.lastX
            let nextY = e.clientY - objectCoordinate.startY + objectCoordinate.lastY

            nextX = nextX < offsetX ? offsetX : nextX
            nextY = nextY < offsetY ? offsetY : nextY
  
            obj.style.top = `${nextY}px`
            obj.style.left = `${nextX}px`

            
            
          }
          
          document.addEventListener("mouseup", handleMouseUpGeneral)
        }

        // console.log(e)
      }
      // Main Project Canvas
      CanvasContainer.addEventListener("mousemove", handleMouseMove);
      CanvasContainer.addEventListener("mouseleave", handleMouseUp);

      // Sidebar Canvas
      // SidebarCanvas.addEventListener("mousemove",)
      // SidebarCanvas.addEventListener("mouseleave")
      return () => {
        objects.forEach(object=> {
          (object as HTMLElement).removeEventListener("mousedown", (e) => handleMouseDown(e, object as HTMLElement));
          (object as HTMLElement).removeEventListener("mouseup", handleMouseUp);
          (object as HTMLElement).addEventListener("focus", (e)=> (e.target as HTMLElement).style.outline = "2px solid #7c7c06");
          (object as HTMLElement).addEventListener("focusout", (e)=> (e.target as HTMLElement).style.outline = "none");
          (object as HTMLElement).addEventListener("keyup", e=>handleShapeDelete(e, object as HTMLElement));
          // object.removeEventListener("mousemove", handleMouseMove)
        })
        document.querySelectorAll(".point-indicators").forEach(point => {
          (point as HTMLElement).removeEventListener("mousedown", (e)=> handleMouseDown(e, point as HTMLElement));
          (point as HTMLElement).removeEventListener("mouseup", handleMouseUp);
          (point as HTMLElement).addEventListener("dblclick", e => createMultiplePoint(e, point as HTMLElement))
        })
        CanvasContainer.removeEventListener("mousemove", handleMouseMove);
        CanvasContainer.removeEventListener("mouseleave", handleMouseUp);
        
      }
    }, [handleMouseDown, handleMouseUp, DrawPoint, createMultiplePoint, handleMouseUpGeneral])


    
  return (
    <div onDragOver={isOpened ? (e)=>false :  (e)=> e.preventDefault()} className="relative flex-auto bg-white cursor-move border-l" ref={canvasRef} onDrop={handleDrop}>
          { 
            isOpened &&<ObjectForm formFields={formFields} position={objectFormPosition} handleFormState={handleFormState} saveForm={handleFormSave} formState={formState as { [key: string]: string; }}/>
          }

    </div>
  )
}

export default Canvas

"use client";
import { useEffect, useContext, useRef, useCallback, DragEventHandler} from "react";
import ProjectSidebar from "./ProjectSidebar"
import { ProjectContext } from "../context/ProjectProvider";


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
const Project = ({params}: {params: {id: string}}) => {
    const canvasRef = useRef<HTMLDivElement>(null!)
    const currentObject = useRef<HTMLElement>(null!)
    const objectData = useRef<{[key: string]: objectCoords}>({})
    const pointStore = useRef<{[key: string]: ["M"] | ["L", number, number?]}>({})
    const currentActivePoint = useRef<HTMLSpanElement | null>(null)

    const onMouseDown = useRef(false)
    // const {isDragging, setIsDragging} = useContext(ProjectContext)


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
      const objectDetails = objectData.current[object.id]
      objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] = [pointX, pointY]
      point.style.left = `${pointX}px`
      point.style.top = `${pointY}px`
      const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
      const path = object.querySelector("svg path")
      path?.setAttribute("d", coordString)
      // 
    }, [])



    const handleShapeDelete = (e: KeyboardEvent, element: HTMLElement) => {
      if (e.keyCode === 8 || e.keyCode === 46) element.remove()
    }



    const handleDblClick = (e: MouseEvent, element: HTMLElement) => {
      element.setAttribute("contenteditable", "true")
      element.style.border = "1px solid black"
    }
    const handleMouseUpGeneral = (e: MouseEvent) => {
      onMouseDown.current = false
      if (currentActivePoint.current) {
        currentActivePoint.current.style.transform = "scale(1.0) translate(-50%, -50%)"
        currentActivePoint.current = null
      } 
    }
    

    const handleMouseDown = useCallback((e: MouseEvent, obj: HTMLElement) => {
      // console.log("event target", e.target)
      // console.log("obj", obj)

      if (obj.classList.contains("point-indicators")) {
          currentActivePoint.current = obj
          obj.style.transform = "scale(1.5) translate(-40%, -40%)"
          // console.log(e.clientX, e.clientY)
      } else {
          currentObject.current = obj
          objectData.current[obj.id].startX = e.clientX
          objectData.current[obj.id].startY = e.clientY
      }
      onMouseDown.current = true
      document.removeEventListener("mouseup", handleMouseUpGeneral)
      // console.log(e)
    }, [])
    
    const handleMouseUp = useCallback((e: MouseEvent, obj?: HTMLElement) => {
      if (onMouseDown.current) {
        if (currentActivePoint.current) {
          currentActivePoint.current.style.transform = "scale(1.0) translate(-50%, -50%)"
          currentActivePoint.current = null
        } else {
          let obj = currentObject.current
          objectData.current[obj.id].lastX = obj?.offsetLeft as number
          objectData.current[obj.id].lastY = obj?.offsetTop as number

          if (obj.getAttribute("data-variant") !== "line") {
            // Get all the lines
            const lines = document.querySelectorAll("[data-variant=line]")
            lines.forEach(line => {
              // For each line check if the currentObject been dragged/move is in contact with the any line or with 5px range
              const objectOffsetX = obj.offsetLeft
              const objectOffsetY = obj.offsetTop
              const objectOffsetYBottom = obj.getBoundingClientRect().bottom - canvasRef.current.getBoundingClientRect().y
              const objectOffsetXRight = obj.getBoundingClientRect().right - canvasRef.current.getBoundingClientRect().x

              const offsetLineX = (line as HTMLElement).offsetLeft
              const offsetLineY = (line as HTMLElement).offsetTop
              const lineData = objectData.current[line.id]
              const coordinates = lineData.lineCoordinates!
              const M = coordinates.M
              const L = coordinates.L[coordinates.L.length - 1]
              const mXAxis = M[0] + offsetLineX
              const mYAxis = M[1] + offsetLineY
              const lXAxis = L[0] + offsetLineX
              const lYAxis = L[1] + offsetLineY
              // console.log(objectOffsetYBottom, mYAxis)
              // console.log("Match", Math.abs(objectOffsetYBottom - mYAxis))
              if (objectOffsetYBottom === mYAxis || Math.abs(objectOffsetYBottom - mYAxis) < 10) {
                // Dragging the object in from the top (M coordinates)
                if (mXAxis >= objectOffsetX && mXAxis <= objectOffsetXRight) {
                  const objWidthMidpoint = obj.getBoundingClientRect().width / 2
                  const objHeightMidpoint = obj.getBoundingClientRect().height
                  const newObjectOffsetX = mXAxis - objWidthMidpoint + 6
                  const newObjectOffsetY = mYAxis - objHeightMidpoint + 6
                  // console.log(mYAxis, "myaxis")
                  if (newObjectOffsetX < 6 || newObjectOffsetY < 6)
                    return
                  obj.style.top = `${newObjectOffsetY}px`;
                  obj.style.left = `${newObjectOffsetX}px`;
                  objectData.current[obj.id].lastX = newObjectOffsetX
                  objectData.current[obj.id].lastY = newObjectOffsetY

                }
              }
              if (objectOffsetY === lYAxis || Math.abs(objectOffsetY - lYAxis) < 10) {
                // Dragging the object in from bottom (L coordinates)
                if (lXAxis >= objectOffsetX && lXAxis <= objectOffsetXRight) {
                  const objWidthMidpoint = obj.getBoundingClientRect().width / 2
                  const newObjectOffsetX = lXAxis - objWidthMidpoint + 6
                  const newObjectOffsetY = lYAxis + 6
                  // console.log(mYAxis, "myaxis")

                  obj.style.top = `${newObjectOffsetY}px`;
                  obj.style.left = `${newObjectOffsetX}px`;
                  objectData.current[obj.id].lastX = newObjectOffsetX
                  objectData.current[obj.id].lastY = newObjectOffsetY
                }
              }
             
              if (objectOffsetXRight === mXAxis || Math.abs(objectOffsetXRight - mXAxis) < 10) {
                // Dragging the object in from the left (for M coordinates)
                if (mYAxis >= objectOffsetY && mYAxis <= objectOffsetYBottom) {
                  const objHeightMidpoint = obj.getBoundingClientRect().height / 2
                  const objWidth = obj.getBoundingClientRect().width
                  const newObjectOffsetX = mXAxis - objWidth + 6
                  const newObjectOffsetY = mYAxis - objHeightMidpoint + 6
                  if (newObjectOffsetX < 6 || newObjectOffsetY < 6)
                    return
                  obj.style.top = `${newObjectOffsetY}px`;
                  obj.style.left = `${newObjectOffsetX}px`;
                  objectData.current[obj.id].lastX = newObjectOffsetX
                  objectData.current[obj.id].lastY = newObjectOffsetY

                }
              }
              
              if (objectOffsetX === mXAxis || Math.abs(objectOffsetX - mXAxis) < 10) {
                // Dragging the object in from the right (for M coordinates)
                if (mYAxis >= objectOffsetY && mYAxis <= objectOffsetYBottom) {
                  const objHeightMidpoint = obj.getBoundingClientRect().height / 2
                  const newObjectOffsetX = mXAxis + 6
                  const newObjectOffsetY = mYAxis - objHeightMidpoint + 6
                  obj.style.top = `${newObjectOffsetY}px`;
                  obj.style.left = `${newObjectOffsetX}px`;
                  objectData.current[obj.id].lastX = newObjectOffsetX
                  objectData.current[obj.id].lastY = newObjectOffsetY

                }
              }

              if (objectOffsetXRight === lXAxis || Math.abs(objectOffsetXRight - lXAxis) < 10) {
                // Dragging the object in from the left (for L coordinates)
                if (lYAxis >= objectOffsetY && lYAxis <= objectOffsetYBottom) {
                  const objHeightMidpoint = obj.getBoundingClientRect().height / 2
                  const objWidth = obj.getBoundingClientRect().width
                  const newObjectOffsetX = lXAxis - objWidth + 6
                  const newObjectOffsetY = lYAxis - objHeightMidpoint + 6
                  if (newObjectOffsetX < 6 || newObjectOffsetY < 6)
                    return
                  obj.style.top = `${newObjectOffsetY}px`;
                  obj.style.left = `${newObjectOffsetX}px`;
                  objectData.current[obj.id].lastX = newObjectOffsetX
                  objectData.current[obj.id].lastY = newObjectOffsetY

                }
              }
              if (objectOffsetX === lXAxis || Math.abs(objectOffsetX - lXAxis) < 10) {
                // Dragging the object in from the right (for L coordinates)
                if (lYAxis >= objectOffsetY && lYAxis <= objectOffsetYBottom) {
                  const objHeightMidpoint = obj.getBoundingClientRect().height / 2
                  const newObjectOffsetX = lXAxis + 6
                  const newObjectOffsetY = lYAxis - objHeightMidpoint + 6
                  obj.style.top = `${newObjectOffsetY}px`;
                  obj.style.left = `${newObjectOffsetX}px`;
                  objectData.current[obj.id].lastX = newObjectOffsetX
                  objectData.current[obj.id].lastY = newObjectOffsetY

                }
              }
          
            })
            
          }

        }
       

        onMouseDown.current = false
        document.removeEventListener("mouseup", handleMouseUpGeneral)
      }
      
    }, [])


    const createMultiplePoint = useCallback((e: MouseEvent, point: HTMLSpanElement) => {

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
        const objectDetails = objectData.current[object.id]
        objectDetails.lineCoordinates![newPointDetails[0]][newPointDetails[1]!] = objectDetails.lineCoordinates![pointDetails[0]][pointDetails[1]!] as [number, number]
        const coordString = LineCoordinateToPathString(objectDetails.lineCoordinates!)
        path?.setAttribute("d", coordString)

      }


    }, [handleMouseDown, handleMouseUp])



    const showPointVisibility = (e: FocusEvent | MouseEvent, element: HTMLElement) => {
      const indicators = element.querySelectorAll(".point-indicators")
      indicators.forEach(indicator => {
        indicator.classList.remove("hide-indicator")
      }) 
    }

    const hidePointVisibility = (e: FocusEvent, element: HTMLElement) => {
      const indicators = element.querySelectorAll(".point-indicators")
      indicators.forEach(indicator => {
        indicator.classList.add("hide-indicator")
      }) 
    }

    const handleInput = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement

      if (element.textContent!.length === 0 && e.keyCode === 8 && element.classList.contains("placeholder-style"))
        element.remove()
      
      if (element.textContent!.length > 0) element.classList.remove("placeholder-style")
      else element.classList.add("placeholder-style")

      
      
    }
  
    const handleDrop = (e: DragEvent) => {

      let defaultCoords: objectCoords = {
        startX: 0, 
        startY: 0, 
        lastX: 0, 
        lastY: 0,
        
      }
      const elementId = e.dataTransfer?.getData("elementId");
      if (!elementId) return
      const element = document.getElementById(elementId as string)
      const newEl = element?.cloneNode(true) as HTMLElement
      const canvasX = canvasRef.current.getBoundingClientRect().x
      const canvasY = canvasRef.current.getBoundingClientRect().y
      newEl.setAttribute("tabindex", "-1")
     
      // 
      // newEl.style.outline = "1px solid red"
      let x = e.clientX - canvasX - 30
      let y = e.clientY - canvasY - 30


      // Text
      if (elementId === "shape-text") {
        newEl.classList.remove('text-2xl')
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
      } else if (elementId === "shape-line") {
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
      newEl.setAttribute("id", uuid4)
      newEl.removeAttribute("draggable")
      newEl.classList.add("absolute")
      newEl.classList.add("cursor-move")
      newEl.classList.remove("cursor-grabbing")
      x = x < 6 ? 6 : x
      y = y < 6 ? 6 : y
      
      objectData.current[uuid4] = defaultCoords
      objectData.current[uuid4].lastX = x
      objectData.current[uuid4].lastY = y
      newEl.style.top = `${y}px`
      newEl.style.left = `${x}px`
      if (elementId !== "shape-line") newEl.style.transform = "scale(1.25)"
      newEl.addEventListener("mousedown", (e) => handleMouseDown(e, newEl));
      newEl.addEventListener("mouseup", handleMouseUp);
      canvasRef.current.appendChild(newEl)
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
            let offsetX = 6
            let offsetY = 6
            if (obj.getAttribute("data-variant") === "line") {
              // To prevent Lines from going over the edge
              const {offsetLeft, offsetTop} = checkLineBoundary(e, obj)
            
              offsetX = offsetLeft > offsetX ? offsetLeft : offsetX
              offsetY = offsetTop > offsetY ? offsetTop : offsetY
            }
            
            let nextX = e.clientX - objectData.current[obj.id].startX + objectData.current[obj.id].lastX
            let nextY = e.clientY - objectData.current[obj.id].startY + objectData.current[obj.id].lastY

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
    }, [handleMouseDown, handleMouseUp, DrawPoint, createMultiplePoint])
  return (
    <>
        <ProjectSidebar params={params} />
        <div onDragOver={(e)=> e.preventDefault()} className="relative flex-auto bg-white cursor-move border-l" ref={canvasRef} onDrop={handleDrop}>
            {/* <div id="shape-circle" className="objects bg-transparent absolute">
                <svg height="50" width="50" xmlns="http://www.w3.org/2000/svg"  className="bg-transparent">
                    <circle r="24" cx="25" cy="25" fill='transparent' stroke="black" strokeWidth="1" />
                </svg>
            </div> */}
        </div>

    </>
  )
}

export default Project

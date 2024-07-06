"use client";
import { useEffect, useContext, useRef, useCallback} from "react";
import ProjectSidebar from "./ProjectSidebar"
import { ProjectContext } from "../context/ProjectProvider";


type objectCoords = {
  startX: number, 
  startY: number, 
  lastX: number, 
  lastY: number
}
const Project = ({params}: {params: {id: string}}) => {
    const canvasRef = useRef<HTMLDivElement>(null!)
    const currentObject = useRef<HTMLElement>(null!)
    const objectData = useRef<{[key: string]: objectCoords}>({})

    const onMouseDown = useRef(false)
    // const {isDragging, setIsDragging} = useContext(ProjectContext)


    const handleShapeDelete = (e: KeyboardEvent, element: HTMLElement) => {
      if (e.keyCode === 8 || e.keyCode === 46) element.remove()
    }
    const handleDblClick = (e: MouseEvent, element: HTMLElement) => {
      element.setAttribute("contenteditable", "true")
      element.style.border = "1px solid black"
    }
    const handleMouseUpGeneral = (e: MouseEvent) => {
      onMouseDown.current = false
    }
    

    const handleMouseDown = useCallback((e: MouseEvent, obj: HTMLElement) => {
      // console.log("event target", e.target)
      // console.log("obj", obj)
      currentObject.current = obj
      onMouseDown.current = true
      objectData.current[obj.id].startX = e.clientX
      objectData.current[obj.id].startY = e.clientY
      document.removeEventListener("mouseup", handleMouseUpGeneral)
      // console.log(e)
    }, [])
    
    const handleMouseUp = useCallback((e: MouseEvent, obj?: HTMLElement) => {
      if (onMouseDown.current) {
        obj = currentObject.current
  
        onMouseDown.current = false
        objectData.current[obj.id].lastX = obj?.offsetLeft as number
        objectData.current[obj.id].lastY = obj?.offsetTop as number
        document.removeEventListener("mouseup", handleMouseUpGeneral)
      }
      
    }, [])

    const handleInput = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement
      if (element.textContent!.length === 0 && e.keyCode === 8) element.remove()
      if (element.textContent!.length > 0) element.classList.remove("placeholder-style")
      else element.classList.add("placeholder-style")
      
    }
  
    const handleDrop = (e: DragEvent) => {
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
      if (elementId === "shape-text") {
        newEl.classList.remove('text-2xl')
        newEl.style.display = "inline-block"
        newEl.setAttribute("data-placeholder", "Text")
        newEl.style.minHeight = "1.5rem"
        newEl.style.minWidth = "5rem"
        newEl.style.maxWidth = "10rem"
        newEl.style.fontSize = "0.8rem"
        newEl.style.lineHeight = "1"
        newEl.style.padding = "0.2rem 0.1rem"
        newEl.style.outline = "none"
        newEl.classList.add("placeholder-style")
        newEl.textContent = ""
        newEl.addEventListener("dblclick", (e) => handleDblClick(e, newEl))
        newEl.addEventListener("focusout", ()=>{
          newEl.removeAttribute("contenteditable")
          newEl.style.color = "black"
          newEl.style.border = "none"
        })
        newEl.addEventListener("keyup", handleInput)
      } else {
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
      const defaultCoords = {
        startX: 0, 
        startY: 0, 
        lastX: 0, 
        lastY: 0
      }
      objectData.current[uuid4] = defaultCoords
      objectData.current[uuid4].lastX = x
      objectData.current[uuid4].lastY = y
      newEl.style.top = `${y}px`
      newEl.style.left = `${x}px`
      newEl.style.transform = "scale(1.25)"
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
          const obj = currentObject.current as HTMLElement
          // console.log("objcoords", objCoords.current)
          let nextX = e.clientX - objectData.current[obj.id].startX + objectData.current[obj.id].lastX
          let nextY = e.clientY - objectData.current[obj.id].startY + objectData.current[obj.id].lastY
          // console.log(nextX, nextY)
          nextX = nextX < 6 ? 6 : nextX
          nextY = nextY < 6 ? 6 : nextY
          // console.log(nextX, nextY)
          // obj.style.transform = `translate(${nextX}px, ${nextY}px)`
          obj.style.top = `${nextY}px`
          obj.style.left = `${nextX}px`
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
        CanvasContainer.removeEventListener("mousemove", handleMouseMove);
        CanvasContainer.removeEventListener("mouseleave", handleMouseUp);
        
      }
    }, [handleMouseDown, handleMouseUp])
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

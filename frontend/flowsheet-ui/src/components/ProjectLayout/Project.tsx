"use client";
import { useEffect, useContext, useRef} from "react";
import ProjectSidebar from "./ProjectSidebar"
import { ProjectContext } from "../context/ProjectProvider";

const Project = ({params}: {params: {id: string}}) => {
    const canvasRef = useRef<HTMLDivElement>(null!)
    const currentObject = useRef<HTMLElement>(null!)
    const objCoords = useRef<{
      startX: number, 
      startY: number, 
      lastX: number, 
      lastY: number}>({
        startX: 0, startY: 0, lastX: 0, lastY: 0
      })

    const onMouseDown = useRef(false)
    const {isDragging, setIsDragging} = useContext(ProjectContext)

    
    // const handleMouseleave = (e: MouseEvent, obj: HTMLElement) => {
    //   if (!obj.classList.contains("cursor-grab")) {
    //     obj.classList.remove("cursor-grabbing")
    //     obj.classList.add("cursor-grab")
    //   }
    // }
    const handleMouseUpGeneral = (e: MouseEvent) => {
      onMouseDown.current = false
    }
    

    const handleMouseDown = (e: MouseEvent, obj: HTMLElement) => {
      currentObject.current = obj
      onMouseDown.current = true
      objCoords.current.startX = e.clientX
      objCoords.current.startY = e.clientY
      console.log("objcoords in mouse down", objCoords.current)
      document.removeEventListener("mouseup", handleMouseUpGeneral)


      // console.log(e)
    }
    
    const handleMouseUp = (e: MouseEvent, obj?: HTMLElement) => {
      if (onMouseDown.current) {
        if (!obj) obj = currentObject.current
        // const obj = (e.target as HTMLElement).closest("div");
        onMouseDown.current = false
        objCoords.current.lastX = obj?.offsetLeft as number
        objCoords.current.lastY = obj?.offsetTop as number
        document.removeEventListener("mouseup", handleMouseUpGeneral)
      }
      
      // console.log(e)
    }
  
    const handleDrop = (e: DragEvent) => {
      const elementId = e.dataTransfer?.getData("elementId");
      const element = document.getElementById(elementId as string)
      const newEl = element?.cloneNode(true) as HTMLElement
      const canvasX = canvasRef.current.getBoundingClientRect().x
      const canvasY = canvasRef.current.getBoundingClientRect().y
      
      let x = e.clientX - canvasX - 30
      let y = e.clientY - canvasY - 30
      newEl.removeAttribute("id")
      newEl.removeAttribute("draggable")
      newEl.classList.add("absolute")
      newEl.classList.add("cursor-move")
      newEl.classList.remove("cursor-grabbing")
      x = x < 6 ? 6 : x
      y = y < 6 ? 6 : y
      objCoords.current.lastX = x
      objCoords.current.lastY = y
      newEl.style.top = `${y}px`
      newEl.style.left = `${x}px`
      newEl.style.transform = "scale(1.25)"
      newEl.addEventListener("mousedown", (e) => handleMouseDown(e, newEl));
      newEl.addEventListener("mouseup", (e) => handleMouseUp(e, newEl));
      canvasRef.current.appendChild(newEl)
    }

    useEffect(()=> {
      const CanvasContainer = canvasRef.current
      const objects = document.querySelectorAll(".objects")
      // console.log(objects)
    
  
      
      const handleMouseMove = (e: MouseEvent) => {
        console.log("mouse move")
        if (onMouseDown.current) {
          const obj = currentObject.current as HTMLElement
          // console.log("objcoords", objCoords.current)
          let nextX = e.clientX - objCoords.current.startX + objCoords.current.lastX
          let nextY = e.clientY - objCoords.current.startY + objCoords.current.lastY 
          // console.log(nextX, nextY)
          nextX = nextX < 6 ? 6 : nextX
          nextY = nextY < 6 ? 6 : nextY
          console.log(nextX, nextY)
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
          (object as HTMLElement).removeEventListener("mouseup", (e) => handleMouseUp(e, object as HTMLElement));
          // object.removeEventListener("mousemove", handleMouseMove)
        })
        CanvasContainer.removeEventListener("mousemove", handleMouseMove);
        CanvasContainer.removeEventListener("mouseleave", handleMouseUp);
      }
    }, [])
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

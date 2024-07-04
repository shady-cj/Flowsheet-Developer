"use client"
import {createContext, useState, Dispatch, SetStateAction} from 'react'

type contextType = {
  isDragging: boolean,
  setIsDragging: Dispatch<SetStateAction<boolean>>,
  mouseDown: boolean

}
export const ProjectContext = createContext<contextType>(null!)


const ProjectProvider = ({children}: {children: React.ReactNode}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [mouseDown, setMouseDown] = useState(false)
 
  return (
    <ProjectContext.Provider value={{isDragging, setIsDragging, mouseDown}}>
      {children}
    </ProjectContext.Provider>
  )
}

export default ProjectProvider

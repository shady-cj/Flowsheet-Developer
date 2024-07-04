import React from 'react'

const Triangle = () => {
  return (
        <div id="shape-triangle" className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <svg height="50" width="50" xmlns="http://www.w3.org/2000/svg">
              <polygon points="25,0 0,49 49,49" fill="transparent" stroke="black" strokeWidth="1" />
            </svg>
        </div>
  )
}

export default Triangle

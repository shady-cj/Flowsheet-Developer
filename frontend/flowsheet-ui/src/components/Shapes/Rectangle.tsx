import React from 'react'

const Rectangle = () => {
  return (
    <div id="shape-rectangle" className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg height="35" width="60" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="35" x="0" y="0" fill="transparent" stroke="black" strokeWidth="2" />
        </svg>
    </div>
  )
}

export default Rectangle

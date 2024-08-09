import React from 'react'

const Rectangle = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Rectangle" data-object-type={objectType} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg height="35" width="60" xmlns="http://www.w3.org/2000/svg">
            <rect width="60" height="35" x="0" y="0" fill="transparent" stroke="black" strokeWidth="3" />
        </svg>
    </div>
  )
}

export default Rectangle

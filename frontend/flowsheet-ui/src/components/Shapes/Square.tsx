import React from 'react'

const Square = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="square" data-object-type={objectType} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg height="50" width="50" xmlns="http://www.w3.org/2000/svg">
            <rect width="50" height="50" x="0" y="0" fill="transparent" stroke="black" strokeWidth="2" />
        </svg>
    </div>
  )
}

export default Square

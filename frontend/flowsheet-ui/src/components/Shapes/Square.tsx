import React from 'react'

const Square = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Square" data-object-type={objectType} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="26" height="26" rx="5" stroke="#4D4D4D" strokeWidth="2"/>
        </svg>

    </div>
  )
}

export default Square

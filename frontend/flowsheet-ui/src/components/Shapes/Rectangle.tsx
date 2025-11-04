import React from 'react'

const Rectangle = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Rectangle" data-object-type={objectType} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="50" height="26" rx="5" stroke="#4D4D4D" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
        </svg>

    </div>
  )
}

export default Rectangle

import React from 'react'

const Ellipse = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Ellipse" data-object-type={objectType}  className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg height="35" width="60" xmlns="http://www.w3.org/2000/svg">
            <ellipse rx="29" ry="16" cx="30" cy="17.5" fill="transparent" stroke="black" strokeWidth="1" />
        </svg>
    </div>
  )
}

export default Ellipse

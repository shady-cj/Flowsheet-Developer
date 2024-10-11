import React from 'react'

const Polygon = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Polygon" data-object-type={objectType}  className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.1213 2.70711C14.9497 1.53553 13.0503 1.53553 11.8787 2.70711L2.70711 11.8787C1.53553 13.0503 1.53553 14.9497 2.70711 16.1213L11.8787 25.2929C13.0503 26.4645 14.9497 26.4645 16.1213 25.2929L25.2929 16.1213C26.4645 14.9497 26.4645 13.0503 25.2929 11.8787L16.1213 2.70711Z" stroke="#4D4D4D" strokeWidth="2"/>
        </svg>
    </div>
  )
}

export default Polygon

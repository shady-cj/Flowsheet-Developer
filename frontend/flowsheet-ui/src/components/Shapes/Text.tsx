import React from 'react'

const Text = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Text" data-object-type={objectType} className="objects bg-transparent cursor-grab text-2xl" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}} >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.66992 7.17003V5.35003C2.66992 4.20003 3.59992 3.28003 4.73992 3.28003H19.2599C20.4099 3.28003 21.3299 4.21003 21.3299 5.35003V7.17003" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 20.72V4.10999" stroke="#4D4D4D" stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8.05957 20.72H15.9396" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

export default Text

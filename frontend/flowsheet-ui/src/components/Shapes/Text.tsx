import React from 'react'

const Text = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Text" data-object-type={objectType} className="objects bg-transparent cursor-grab text-2xl" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}} >
        Text
    </div>
  )
}

export default Text

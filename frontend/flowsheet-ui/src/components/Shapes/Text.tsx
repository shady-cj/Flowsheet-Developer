import React from 'react'

const Text = () => {
  return (
    <div id="shape-text" className="objects bg-transparent cursor-grab text-2xl" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}} >
        Text
    </div>
  )
}

export default Text



const Circle = ({objectType, objectId}: {objectType: string, objectId: string}) => {
  return (
    <div id={objectId} data-object-name="Circle" data-object-type={objectType} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="13" stroke="#4D4D4D" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
      </svg>
    </div>
  )
}

export default Circle

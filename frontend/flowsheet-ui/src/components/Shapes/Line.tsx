

const Line = ({objectType, objectId, forCanvas}: {objectType: string, objectId: string, forCanvas?:boolean}) => {
  return (
    <div id={objectId} data-object-name="Line" data-object-type={objectType} className="objects bg-transparent cursor-grab text-2xl" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}} >
      <div className="line-wrap relative">
      {
        forCanvas? <svg height="30" width="30" xmlns="http://www.w3.org/2000/svg" className="overflow-visible line-svg">
        <path d="M0 10 L30 10" fill="none" stroke="black" strokeWidth="1.5"/>
        </svg> : <svg width="33" height="12" viewBox="0 0 33 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5C0.447715 5 0 5.44772 0 6C0 6.55228 0.447715 7 1 7V5ZM1 7H25V5H1V7Z" fill="#4D4D4D"/>
        <path d="M32.3926 6L22.0003 12L25 6L22.0003 0L32.3926 6Z" fill="#4D4D4D"/>
        </svg>
      }
      
      </div>

    </div>
  )
}

 {/* */}

export default Line

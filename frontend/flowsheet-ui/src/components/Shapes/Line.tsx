

const Line = () => {
  return (
    <div id="shape-line" className="objects bg-transparent cursor-grab text-2xl" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}} >
      <div className="line-wrap relative">

       <svg height="50" width="60" xmlns="http://www.w3.org/2000/svg" className="min-w-[60px] min-h-[50px] overflow-visible">
            <path d="M50 0 L20 50" fill="none" stroke="black" strokeWidth="1"/>
        </svg>
      </div>

    </div>
  )
}

export default Line
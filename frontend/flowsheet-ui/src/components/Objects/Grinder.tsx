import Image from "next/image";
import { genericImageObjectType } from "../FlowsheetLayout/FlowsheetSidebar";

const Grinder = ({grinder}: {grinder: genericImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2 h-full" key={grinder.id}>
      <div className="w-4/5">
        <div id={grinder.id} data-object-name={grinder.name} data-object-type={"Grinder"} className="flex-1 flex items-center justify-center objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={grinder.image_width} height={grinder.image_height} src={grinder.image_url!} alt="" draggable={false} quality={100}/>
        </div>
      </div>
      <p className="text-xs font-medium text-black-2 text-center mt-auto">{grinder.name}</p>
    </div>
  )
}

export default Grinder

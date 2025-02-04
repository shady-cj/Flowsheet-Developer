import Image from "next/image";
import { ConcentratorImageObjectType } from "../FlowsheetLayout/FlowsheetSidebar";

const Concentrator = ({concentrator}: {concentrator: ConcentratorImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2 h-full">
        <div id={concentrator.id} data-object-name={concentrator.name} data-object-type={"Concentrator"}className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={concentrator.image_width} height={concentrator.image_height} src={concentrator.image_url!} alt="" draggable={false} quality={100}/>
        </div>
        <p className="text-sm font-medium text-black-2">{concentrator.name}</p>
    </div>
  )
}

export default Concentrator

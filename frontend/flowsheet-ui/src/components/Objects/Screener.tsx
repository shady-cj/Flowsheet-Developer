import Image from "next/image";
import { genericImageObjectType } from "../FlowsheetLayout/FlowsheetSidebar";

const Screener = ({screener}: {screener: genericImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2 h-full" key={screener.id}>
        <div id={screener.id} data-object-name={screener.name} data-object-type={"Screener"} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={screener.image_width} height={screener.image_height} src={screener.image_url!} alt="" draggable={false} quality={100}/>
        </div>
        <p className="text-xs font-medium text-black-2 text-center mt-auto">{screener.name}</p>
    </div>
  )
}

export default Screener

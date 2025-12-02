import Image from "next/image";
import { genericImageObjectType } from "../FlowsheetLayout/FlowsheetSidebar";

const Crusher = ({crusher}: {crusher: genericImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2 h-full" key={crusher.id}>
      <div className="w-4/5">
        <div id={crusher.id} data-object-name={crusher.name} data-object-type={"Crusher"} className="flex-1 flex items-center justify-center objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={crusher.image_width} height={crusher.image_height} src={crusher.image_url!} alt="" draggable={false} quality={100}/>
        </div>
      </div>
      <p className="text-xs font-medium text-black-2 text-center mt-auto">{crusher.name}</p>
    </div>
  )
}

export default Crusher

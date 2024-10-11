import Image from "next/image";
import { genericImageObjectType } from "../ProjectLayout/ProjectSidebar";

const Grinder = ({grinder}: {grinder: genericImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2">
        <div id={grinder.id} data-object-name={grinder.name} data-object-type={"Grinder"} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={grinder.image_width} height={grinder.image_height} src={grinder.image_url!} alt="" draggable={false}/>
        </div>
        <p className="text-sm font-medium text-black-2">{grinder.name}</p>
    </div>
  )
}

export default Grinder

import Image from "next/image";
import { genericImageObjectType } from "../ProjectLayout/ProjectSidebar";

const Crusher = ({crusher}: {crusher: genericImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2">
        <div id={crusher.id} data-object-name={crusher.name} data-object-type={"Crusher"} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={crusher.image_width} height={crusher.image_height} src={crusher.image_url!} alt="" draggable={false} quality={100}/>
        </div>
        <p className="text-sm font-medium text-black-2">{crusher.name}</p>
    </div>
  )
}

export default Crusher

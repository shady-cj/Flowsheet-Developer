import Image from "next/image";
import { AuxilliaryImageObjectType } from "../ProjectLayout/ProjectSidebar";


const Auxilliary = ({auxilliary}: {auxilliary: AuxilliaryImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2" key={auxilliary.id}>
        <div id={auxilliary.id} data-object-name={auxilliary.name} data-object-type={"Auxilliary"} data-object-type-variant={auxilliary.type} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={50} height={50} src={auxilliary.image_url!} alt="" className="w-[50px] h-auto" draggable={false}/>
        </div>
        <p className="text-sm font-bold">{auxilliary.name}</p>
    </div>
  )
}

export default Auxilliary

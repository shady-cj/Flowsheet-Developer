import Image from "next/image";
import { genericImageObjectType } from "../ProjectLayout/ProjectSidebar";

const Screener = ({screener}: {screener: genericImageObjectType}) => {
  return (
    <div className="flex flex-col justify-between items-center gap-2" key={screener.id}>
        <div id={screener.id} data-object-name={screener.name} data-object-type={"Screener"} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={50} height={50} src={screener.image_url!} alt="" className="w-[50px] h-auto" draggable={false}/>
        </div>
        <p className="text-sm font-bold">{screener.name}</p>
    </div>
  )
}

export default Screener

import Image from "next/image";
import { AuxilliaryImageObjectType } from "../FlowsheetLayout/FlowsheetSidebar";


const Auxilliary = ({auxilliary}: {auxilliary: AuxilliaryImageObjectType}) => {
  return (
    <div className="flex flex-col items-center gap-2 h-full" key={auxilliary.id}>
        <div id={auxilliary.id} data-object-name={auxilliary.name} data-object-type={"Auxilliary"} data-object-type-variant={auxilliary.type} className="objects bg-transparent cursor-grab" draggable={true} onDragStart={(e)=>{e.dataTransfer.setData("elementId", (e.target as HTMLDivElement).id)}}>
            <Image width={auxilliary.image_width} height={auxilliary.image_height} src={auxilliary.image_url!} alt="" draggable={false} quality={100}/>
        </div>
        <p className="text-xs font-medium text-black-2 text-center mt-auto">{auxilliary.name}</p>
    </div>
  )
}

export default Auxilliary

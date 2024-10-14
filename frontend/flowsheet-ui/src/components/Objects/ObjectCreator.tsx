import { objectDataType } from "../context/ProjectProvider"
import ConvertStringToShape from "../Shapes/ConvertStringToShape"
import Crusher from "./Crusher"
import Grinder from "./Grinder"
import Screener from "./Screener"
import Auxilliary from "./Auxilliary"

export const ObjectCreator = ({objectData, dataId}:{objectData: objectDataType, dataId: string}): JSX.Element => {
    const data = objectData[dataId]
    const elementObject = data.object!
    switch (elementObject.model_name) {
        case "Shape":

            return <ConvertStringToShape objectType={elementObject.model_name} objectId={elementObject.id} objectName={elementObject.name} forCanvas={true}/>
        case "Crusher":
            return  <Crusher crusher={elementObject}/>
        case "Grinder":
            return <Grinder grinder={elementObject} />

        case "Screener":
            return <Screener screener={elementObject} />
        case "Auxilliary":
            return <Auxilliary auxilliary={elementObject} />
        default:
            return <div></div>

    }


}
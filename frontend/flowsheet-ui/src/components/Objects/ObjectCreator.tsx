import { objectDataType } from "../context/FlowsheetProvider"
import ConvertStringToShape from "../Shapes/ConvertStringToShape"
import Crusher from "./Crusher"
import Grinder from "./Grinder"
import Screener from "./Screener"
import Auxilliary from "./Auxilliary"
import Concentrator from "./Concentrator"
import { ConcentratorImageObjectType } from "../FlowsheetLayout/FlowsheetSidebar"

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
        case "Concentrator":
            return <Concentrator concentrator={elementObject as ConcentratorImageObjectType} />
        // Add more cases for other object types as needed
        default:
            return <div></div>

    }


}
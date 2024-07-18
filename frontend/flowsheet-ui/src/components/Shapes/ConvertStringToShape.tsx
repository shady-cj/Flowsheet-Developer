
import Circle from "./Circle";
import Rectangle from "./Rectangle";
import Square from "./Square";
import Ellipse from "./Ellipse";
import Triangle from "./Triangle";
import Text from "./Text";
import Line from "./Line";

const ConvertStringToShape = ({objectType, objectName, objectId}: {objectType: string, objectName: string, objectId: string}) => {
  return (
    <>
    {
      objectName === "Circle" ? <Circle objectType={objectType} objectId={objectId}/>: 
      objectName === "Rectangle" ? <Rectangle objectType={objectType} objectId={objectId}/>:
      objectName === "Square" ? <Square objectType={objectType} objectId={objectId}/>:
      objectName === "Ellipse" ? <Ellipse objectType={objectType} objectId={objectId}/>:
      objectName === "Triangle" ? <Triangle objectType={objectType} objectId={objectId}/>:
      objectName === "Text" ? <Text objectType={objectType} objectId={objectId}/>:
      objectName === "Line" ? <Line objectType={objectType} objectId={objectId}/>:""
    }
    </>

  )
}

export default ConvertStringToShape

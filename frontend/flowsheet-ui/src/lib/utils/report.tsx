"use client";
import { objectDataType } from "@/components/context/ProjectProvider"
import { forwardRef } from "react";



/**
 * 
 * Crusher: 
 *  Type: 
 *  Label: 
 *  Description
 *  Gape
 *  Set
 * 
 * Grinder:
 *  Label:
 *  Description:
 *  Gape: 
 *  Set:
 * 
 * Screener:
 *  Label:
 *  Description:
 *  aperture:
 * 
 * Auxilliary:
 *  Label:
 *  Description:
 *  Type: 
 *  if (type == "ore")
 *       maximum size (diameter) of the particle: 
 *       Grade of the ore:
 *       Quantity of ore:
 * 
 * 
 * Line (Connector):
 *   Label: 
 *   Description:
 *   From: 
 *      Label:
 *      Name: "Grinder" or "Crusher" 
 *   To: 
 *      Label:
 *      Name: "Grinder", "Crusher", "Auxilliary"
 * 
 * 
 */
export const createReport = (objectData: objectDataType) => {

    for (const key in objectData) {
        let currentNode = objectData[key]
        console.log("currentNode", currentNode)
    }
}


const Report = ({objectData}: {objectData: objectDataType}) => {
  return (
    <div className="fixed z-60 bg-white top-0 left-0 flex flex-col gap-y-6">
      {
        Object.keys(objectData).map(key=> {
            const currentNode = objectData[key]
            return <section className="flex flex-col gap-2" key={key}>
                        {
                            currentNode.object_info.object_model_name === "Crusher" ? (
                                <>
                                    <h2 className="font-bold text-lg">Crushing Unit</h2>
                                    <p>Name: {currentNode.object!.name}</p>
                                    <p>Label: {currentNode.label}</p>
                                    <p>Description: {currentNode.description}</p>
                                    <p>The crusher is used as a {currentNode.properties.crusherType} crusher in the design</p>
                                    <p>The crusher has a gape of size {currentNode.properties.gape} thus maximum Diameter of feed in which 80% passes is {(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</p>
                                    <p>The crusher has a set of size {currentNode.properties.set} thus maximum Diameter of product in which 80% passes is {(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</p>
                                </> 
                            ): currentNode.object_info.object_model_name === "Grinder" ? (
                                    <>
                                        <h2  className="font-bold text-lg">Milling Unit</h2>
                                        <p>Name: {currentNode.object!.name}</p>
                                        <p>Label: {currentNode.label}</p>
                                        <p>Description: {currentNode.description}</p>
                                        <p>The milling machine has a gape of size {currentNode.properties.gape} thus maximum Diameter of feed in which 80% passes is {(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</p>
                                        <p>The milling machine has a set of size {currentNode.properties.set} thus maximum Diameter of product in which 80% passes is {(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</p>
                                    </>
                            ): currentNode.object_info.object_model_name === "Screener"  ? (
                                    <>
                                        <h2  className="font-bold text-lg">Screening Unit</h2>
                                        <p>Name: {currentNode.object!.name}</p>
                                        <p>Label: {currentNode.label}</p>
                                        <p>Description: {currentNode.description}</p>
                                        <p>The Screener has an aperture of size {currentNode.properties.aperture}</p>
                                    </>
                            ): currentNode.object_info.object_model_name === "Auxilliary" ? (
                                    <>
                                        <h2  className="font-bold text-lg">{currentNode.object!.type === "ORE" ? "ORE MASS" : currentNode.object!.type === "OTHER" ? "AUXILLIARY COMPONENT": currentNode.object!.type}</h2>
                                        <p>Name: {currentNode.object!.name}</p>
                                        <p>Label: {currentNode.label}</p>
                                        <p>Description: {currentNode.description}</p>
                                        {
                                            currentNode.object!.type === "ORE" ? (
                                                <>
                                                    <p>Maximum Diameter of individual particle of Ore: {currentNode.properties.maxOreSize}mm</p>
                                                    <p>Grade of the Ore: {currentNode.properties.oreGrade}</p>
                                                    <p>Quantity of the Ore: {currentNode.properties.oreQuantity}tons</p>
                                                </>

                                            ): ""
                                        }
                                    </>
                            ): currentNode.object!.name !== "Text" ? (
                                    <>
                                
                                        { currentNode.object!.name === "Line" && <h2  className="font-bold text-lg">Connector</h2>}
                                        <p>Label: {currentNode.label}</p>
                                        <p>Description: {currentNode.description}</p>
                                        {
                                            currentNode.object!.name === "Line" ? <>
                                                { currentNode.properties.prevObject.length ? <p>
                                                    From: <br/> &nbsp; &nbsp; &nbsp; 
                                                    Label: {objectData[currentNode.properties.prevObject[0]].label}
                                                    Name: {objectData[currentNode.properties.prevObject[0]].object_info.object_model_name}
                                                </p> : ""}
                                                { currentNode.properties.nextObject.length ? <p>
                                                    To: <br/> &nbsp; &nbsp; &nbsp; 
                                                    Label: {objectData[currentNode.properties.nextObject[0]].label}
                                                    Name: {objectData[currentNode.properties.nextObject[0]].object_info.object_model_name}
                                                </p> : ""}
                                            </>: ""
                                        }
                                    </>
                                ):""
                        }
                </section>
            })
        }
    </div>
  )
}
export default Report

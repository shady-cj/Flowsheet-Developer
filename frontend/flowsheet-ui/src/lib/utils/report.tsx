"use client";
import { objectDataType } from "@/components/context/FlowsheetProvider"
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';



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

const styles = StyleSheet.create({
    page: { 
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    section: { 
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    title: {
        fontWeight: "bold",
        fontSize: "18px"
    }
  });
  

const Report = ({objectData}: {objectData: objectDataType}) => {
  return (
    <Document>
        <Page size="A4" style={styles.page}>
        {
            Object.keys(objectData).map(key=> {
                const currentNode = objectData[key]
                return <View style={styles.section} key={key}>
                            {
                                currentNode.object_info.object_model_name === "Crusher" ? (
                                    <>
                                        <Text style={styles.title}>Crushing Unit</Text>
                                        <Text>Name: {currentNode.object!.name}</Text>
                                        <Text>Label: {currentNode.label}</Text>
                                        <Text>Description: {currentNode.description}</Text>
                                        <Text>The crusher is used as a {currentNode.properties.crusherType} crusher in the design</Text>
                                        <Text>The crusher has a gape of size {currentNode.properties.gape} thus maximum Diameter of feed in which 80% passes is {(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</Text>
                                        <Text>The crusher has a set of size {currentNode.properties.set} thus maximum Diameter of product in which 80% passes is {(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</Text>
                                    </> 
                                ): currentNode.object_info.object_model_name === "Grinder" ? (
                                        <>
                                            <Text  style={styles.title}>Milling Unit</Text>
                                            <Text>Name: {currentNode.object!.name}</Text>
                                            <Text>Label: {currentNode.label}</Text>
                                            <Text>Description: {currentNode.description}</Text>
                                            <Text>The milling machine has a gape of size {currentNode.properties.gape} thus maximum Diameter of feed in which 80% passes is {(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</Text>
                                            <Text>The milling machine has a set of size {currentNode.properties.set} thus maximum Diameter of product in which 80% passes is {(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</Text>
                                        </>
                                ): currentNode.object_info.object_model_name === "Screener"  ? (
                                        <>
                                            <Text  style={styles.title}>Screening Unit</Text>
                                            <Text>Name: {currentNode.object!.name}</Text>
                                            <Text>Label: {currentNode.label}</Text>
                                            <Text>Description: {currentNode.description}</Text>
                                            <Text>The Screener has an aperture of size {currentNode.properties.aperture}</Text>
                                        </>
                                ): currentNode.object_info.object_model_name === "Auxilliary" ? (
                                        <>
                                            <Text  style={styles.title}>{currentNode.object!.type === "ORE" ? "ORE MASS" : currentNode.object!.type === "OTHER" ? "AUXILLIARY COMPONENT": currentNode.object!.type}</Text>
                                            <Text>Name: {currentNode.object!.name}</Text>
                                            <Text>Label: {currentNode.label}</Text>
                                            <Text>Description: {currentNode.description}</Text>
                                            {
                                                currentNode.object!.type === "ORE" ? (
                                                    <>
                                                        <Text>Maximum Diameter of individual particle of Ore: {currentNode.properties.maxOreSize}mm</Text>
                                                        <Text>Grade of the Ore: {currentNode.properties.oreGrade}</Text>
                                                        <Text>Quantity of the Ore: {currentNode.properties.oreQuantity}tons</Text>
                                                    </>

                                                ): ""
                                            }
                                        </>
                                ): currentNode.object!.name !== "Text" ? (
                                        <>
                                    
                                            { currentNode.object!.name === "Line" && <Text  style={styles.title}>Connector</Text>}
                                            <Text>Label: {currentNode.label}</Text>
                                            <Text>Description: {currentNode.description}</Text>
                                            {
                                                currentNode.object!.name === "Line" ? <>
                                                    { currentNode.properties.prevObject.length ? <Text>
                                                        From: <br/> &nbsp; &nbsp; &nbsp; 
                                                        Label: {objectData[currentNode.properties.prevObject[0]].label}
                                                        Name: {objectData[currentNode.properties.prevObject[0]].object_info.object_model_name}
                                                    </Text> : ""}
                                                    { currentNode.properties.nextObject.length ? <Text>
                                                        To: <br/> &nbsp; &nbsp; &nbsp; 
                                                        Label: {objectData[currentNode.properties.nextObject[0]].label}
                                                        Name: {objectData[currentNode.properties.nextObject[0]].object_info.object_model_name}
                                                    </Text> : ""}
                                                </>: ""
                                            }
                                        </>
                                    ):""
                            }
                    </View>
                })
            }
        </Page>
    </Document>
  )
}
export default Report


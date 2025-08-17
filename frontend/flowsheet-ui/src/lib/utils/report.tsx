"use client";
import { objectDataType, singleObjectDataType } from "@/components/context/FlowsheetProvider"
import { Page, Text, View, Document, StyleSheet, Image, Link} from '@react-pdf/renderer';
import { concentratorAnalysis } from "./concentrator-analysis";
import React from "react";




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


export const sortReportData = (objectData: objectDataType) => {
    const data: any = {}

    const addKey = (key: string, obj: singleObjectDataType) => {
        if (data[key]) {
            data[key] = [...data[key], obj]
        } else {
            data[key] = [obj]
        }
    }

    for (const key in objectData) {
        let currentNode = objectData[key]
        if (currentNode.object!.name === "Line")
            addKey("Connectors", currentNode)
        else if (currentNode.object_info.object_model_name === "Crusher")
            addKey("Crushing Components", currentNode)
        else if (currentNode.object_info.object_model_name === "Grinder")
            addKey("Milling Components", currentNode)
        else if (currentNode.object_info.object_model_name === "Screener")
            addKey("Screening Components", currentNode)
        else if (currentNode.object_info.object_model_name === "Concentrator")
            addKey("Concentrator Components", currentNode)
        else if (currentNode.object_info.object_model_name === "Auxilliary")
            addKey("Auxilliary Components", currentNode)
        else if (currentNode.object_info.object_model_name === "Shape" && currentNode.object!.name !== "Line" && currentNode.object!.name !== "Text")
            addKey ("Shape Components", currentNode)
        
        
    }
    return data
}




const styles = StyleSheet.create({
    page: { 
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "32px 24px"
    },
    section: { 
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    subsection: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "10px 14px"
    },
    flowsheetHeader: {
        fontWeight: "bold",
        fontSize: "24px",
        textTransform: "capitalize",
        margin: "10px 0"
    },
    flowsheetDescription: {
        fontSize: "16px",
        margin: "0 6px 10px 6px",
        color: "rgba(0,0,0,0.7)"
    },

    header: {
        fontWeight: "bold",
        fontSize: "18px",
        textTransform: "capitalize",
        color: 'red'
    },
    title: {
        fontWeight: "bold",
        fontSize: "16px",
        textTransform: "capitalize",
        color: 'blue'
    },
    subtitle: {
        fontWeight: "bold",
        fontSize: "14px"
    },
    miniSubtitle: {
        fontWeight: "bold",
        fontSize: "12px"
    },
    text: {
        fontSize: "10px",
        lineHeight: "1.5"
    },
    bold: {
        fontWeight: "bold",
    },
    desc: {
        fontSize: "10px",
        lineHeight: "1.5",
        fontStyle: "italic",
        color: "rgba(0,0,0,0.8)"

    }, 
    imageContainer: {
        margin: "10px 5px"
    }, 
    link: {
        color: "blue",
        textDecoration: "underline",
        cursor: 'pointer'
    }
    
  });
  


export const Report2 = ({objectData, flowsheetName, flowsheetDescription}: {objectData: objectDataType, flowsheetName?: string, flowsheetDescription?: string }) => {
    
    const data = sortReportData(objectData)
    const keys = Object.keys(data)
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {
                
                    flowsheetName ? <Text style={styles.flowsheetHeader}>Report on <Text style={{color: "#D4AF37"}}>{flowsheetName}</Text></Text> : ""
                }
                {
                    flowsheetDescription ? <Text style={styles.flowsheetDescription}>{flowsheetDescription}</Text>: ""
                }
                {
                    keys.map(key => {
                        const currentNodeList = data[key]
                        return (<React.Fragment key={key}>
                            <Text style={styles.header}>{key}</Text>
                            <View style={styles.section}>
                                {
                                    key === "Connectors" ? <ConnectorComponents currentNodeList={currentNodeList} objectData={objectData}/> :
                                    key === "Crushing Components" ? <CrushingComponents currentNodeList={currentNodeList}  />:
                                    key === "Milling Components" ? <MillingComponents currentNodeList={currentNodeList}  /> :
                                    key === "Screening Components" ? <ScreeningComponents currentNodeList={currentNodeList}  /> :
                                    key === "Concentrator Components" ? <ConcentratorComponents currentNodeList={currentNodeList} /> :
                                    key === "Auxilliary Components" ? <AuxilliaryComponents currentNodeList={currentNodeList} /> :
                                    key === "Shape Components" ? <ShapeComponents currentNodeList={currentNodeList} />:
                                    <></>
                                }
                            </View>


                        </React.Fragment>)
                    })
                }
            </Page>

        </Document>
    )
}

// .object.image_url, image_width, image_height




const ConnectorComponents = ({currentNodeList, objectData}:{currentNodeList: singleObjectDataType[], objectData: objectDataType}) => {
    return (
        <>
         {
            currentNodeList.map(currentNode => {
                return (
                     <View style={styles.subsection} key={currentNode.id}> 
                        <Text id={currentNode.oid} style={styles.title} break>{currentNode.label}</Text>
                        <Text style={styles.text}><Text style={styles.bold}>Description of operation:</Text> <Text style={styles.desc}>{currentNode.description}</Text></Text>
                        <View>
                            <View>

                                { 
                                    currentNode.properties.prevObject.length && objectData[currentNode.properties.prevObject[0]] ? 
                                    <View>
                                        <Text style={styles.miniSubtitle}>Source:</Text>
                                        <View style={{padding: "10px 14px", gap: "6px"}}>
                                            <Text style={styles.text}><Text style={styles.bold}>Label: </Text> <Link src={`#${currentNode.properties.prevObject[0]}`}>{objectData[currentNode.properties.prevObject[0]].label}</Link></Text>
                                            <Text style={styles.text}><Text style={styles.bold}>Name: </Text>{objectData[currentNode.properties.prevObject[0]].object_info.object_model_name}</Text>
                                        </View>
                                    </View>
                                    : ""
                                }
                            </View>
                            <View>
                                { 
                                    currentNode.properties.nextObject.length && objectData[currentNode.properties.nextObject[0]] ? 
                                    <View>
                                        <Text style={styles.miniSubtitle}>Destination:</Text>
                                        <View style={{padding: "10px 14px", gap:"6px"}}>
                                            <Text style={styles.text}><Text style={styles.bold}>Label: </Text><Link src={`#${currentNode.properties.nextObject[0]}`}>{objectData[currentNode.properties.nextObject[0]].label}</Link></Text>
                                            <Text style={styles.text}><Text style={styles.bold}>Name: </Text>{objectData[currentNode.properties.nextObject[0]].object_info.object_model_name}</Text>
                                        </View>
                                    </View> : ""
                                }
                            </View>
                        </View>    
                    </View>
                )
            })
         }
           
        </>
    )
}

const CrushingComponents = ({currentNodeList}: {currentNodeList: singleObjectDataType[]}) => {
    return (
        <>
            {
                currentNodeList.map(currentNode =>{
                     return (
                            <View style={styles.subsection} key={currentNode.id}> 
                                <View style={styles.subsection} wrap={false}>
                                    <Text id={currentNode.oid} style={styles.title} break>
                                        {currentNode.label}
                                    </Text>
                                    <View style={{...styles.imageContainer, minHeight: currentNode.object!.image_height}}>
                                        <Image src={currentNode.object?.image_url} style={{height: currentNode.object!.image_height, width: currentNode.object!.image_width}} />
                                    </View>
                                    <View style={styles.subsection}>
                                        <Text style={styles.text}><Text style={styles.bold}>Crusher Type:</Text> {currentNode.object!.name} </Text>
                                        <Text style={styles.text}><Text style={styles.bold}>Description of operation:</Text> <Text style={styles.desc}>
                                            {currentNode.description}
                                        </Text>
                                        </Text>

                                        <Text style={styles.text}>The crusher component is used as a <Text style={styles.bold}>{currentNode.properties.crusherType}</Text> crusher in the design</Text>
                                        <Text style={styles.text}>The crusher component has a gape of size <Text style={styles.bold}>{currentNode.properties.gape}</Text> thus maximum Diameter of feed in which 80% passes is <Text style={styles.bold}>{(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</Text></Text>
                                        <Text style={styles.text}>The crusher component has a set of size <Text style={styles.bold}>{currentNode.properties.set}</Text> thus maximum Diameter of product in which 80% passes is <Text style={styles.bold}>{(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</Text></Text>
                                    </View>
                                </View>
                            </View>
                        ) 
                })
            }
        </>
    )
}

const MillingComponents = ({currentNodeList}: {currentNodeList: singleObjectDataType[]}) => {
    return (
        <>
            {
                currentNodeList.map(currentNode =>{
                     return (
                        <View style={styles.subsection} key={currentNode.id} > 
                            <View style={styles.subsection} wrap={false}>
                                <Text id={currentNode.oid} style={styles.title} break>
                                    {currentNode.label}
                                </Text>
                                 <View style={{...styles.imageContainer, minHeight: currentNode.object!.image_height}}>
                                    <Image src={currentNode.object?.image_url} style={{height: currentNode.object!.image_height, width: currentNode.object!.image_width}}/>
                                </View>
                                <View style={styles.subsection}>
                                    <Text style={styles.text}><Text style={styles.bold}>Miller Type:</Text> {currentNode.object!.name} </Text>
                                    <Text style={styles.text}><Text style={styles.bold}>Description of operation:</Text> <Text style={styles.desc}>
                                        {currentNode.description}
                                    </Text></Text>

                                    <Text style={styles.text}>The grinding component has a gape of size <Text style={styles.bold}>{currentNode.properties.gape}</Text> thus maximum Diameter of feed in which 80% passes is <Text style={styles.bold}>{(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</Text></Text>
                                    <Text style={styles.text}>The grinding component has a set of size <Text style={styles.bold}>{currentNode.properties.set}</Text> thus maximum Diameter of product in which 80% passes is <Text style={styles.bold}>{(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</Text></Text>                                        </View>
                                </View>
                        </View>
                    ) 

                })
            }
        </>
    )
}


const ScreeningComponents = ({currentNodeList}: {currentNodeList: singleObjectDataType[]}) => {
    return (
        <>
            {
                currentNodeList.map(currentNode =>{
                     return (
                        <View style={styles.subsection} key={currentNode.id}> 
                            <View style={styles.subsection} wrap={false}>
                                <Text id={currentNode.oid} style={styles.title} break>
                                    {currentNode.label}
                                </Text>
                                 <View style={{...styles.imageContainer, minHeight: currentNode.object!.image_height}}>
                                    <Image src={currentNode.object?.image_url} style={{height: currentNode.object!.image_height, width: currentNode.object!.image_width}}/>
                                </View>
                                <View style={styles.subsection}>

                                    <Text style={styles.text}><Text style={styles.bold}>Screen Type:</Text> {currentNode.object!.name} </Text>
                                    <Text style={styles.text}><Text style={styles.bold}>Description of operation: </Text><Text style={styles.desc}>
                                        {currentNode.description}
                                    </Text></Text>
                                    <Text style={styles.text}>The Screener component has an aperture of size <Text style={styles.bold}>{currentNode.properties.aperture}</Text></Text>
                                </View>
                            </View>
                        </View>
                    ) 
                })
            }
        </>
    )
}

const ConcentratorComponents = ({currentNodeList}: {currentNodeList: singleObjectDataType[]}) => {
    return (
        <>
            {
                currentNodeList.map(currentNode =>{
                      return (
                            <View style={styles.subsection} key={currentNode.id}> 
                                <View style={styles.subsection} wrap={false}>
                                    <Text id={currentNode.oid} style={styles.title} break>
                                        {currentNode.label}
                                    </Text>
                                     <View style={{...styles.imageContainer, minHeight: currentNode.object!.image_height}}>
                                        <Image src={currentNode.object?.image_url} style={{height: currentNode.object!.image_height, width: currentNode.object!.image_width}}/>
                                    </View>
                                    <Text style={styles.text}><Text style={styles.bold}>Concentrator Type:</Text> {currentNode.object!.name} </Text>
                                    <Text style={styles.text}><Text style={styles.bold}>Description of operation: </Text><Text style={styles.desc}>
                                        {currentNode.description}
                                    </Text></Text>
                                    {
                                        (()=> {
                                            const {
                                            gangue_recoverable,
                                            valuable_recoverable,
                                            feed_quantity,
                                            valuable_in_feed,
                                            gangue_in_feed,
                                            valuable_in_product,
                                            gangue_in_product,
                                            valuable_in_waste,
                                            gangue_in_waste
                                        } = concentratorAnalysis(currentNode)
                                            return (
                                            <View style={styles.subsection}>
                                                <Text style={styles.text}>Quantity of ore going through the concentrator is <Text style={styles.bold}>{feed_quantity} tons</Text></Text>
                                                <Text style={styles.text}>Grade of ore going through the concentrator is <Text style={styles.bold}>{currentNode.properties.oreGrade}</Text></Text>
                                                <Text style={styles.text}>Concentrator recovery (%) of valuable mineral is <Text style={styles.bold}>{valuable_recoverable}%</Text></Text>
                                                <Text style={styles.text}>Concentrator recovery (%) of gangue is <Text style={styles.bold}>{gangue_recoverable}%</Text></Text>
                                                <Text style={styles.subtitle} break>Ore Recovery Analysis.</Text>
                                                <View style={styles.subsection}>
                                                    <Text style={styles.text}>Valuable ore (%) present in the feed going through the concentrator is <Text style={styles.bold}>{valuable_in_feed * 100}%</Text></Text>
                                                    <Text style={styles.text}>Gangue (%) present in the feed going through the concentrator is <Text style={styles.bold}>{gangue_in_feed * 100}%</Text></Text>
                                                    <Text style={styles.text}><Text style={styles.bold}>Concentrate</Text></Text>
                                                    <View style={styles.subsection}>

                                                        <View style={styles.subsection}>
                                                            <Text style={styles.text}>Quantity of valuable ore is <Text style={styles.bold}>{valuable_in_product.toFixed(2)} tons</Text></Text>
                                                            <Text style={styles.text}>Quantity of gangue is <Text style={styles.bold}>{gangue_in_product.toFixed(2)} tons</Text></Text>
                                                        </View>
                                                        <Text style={styles.text}><Text style={styles.bold}>Waste</Text></Text>
                                                        <View style={styles.subsection}>
                                                            <Text style={styles.text}>Quantity of gangue is <Text style={styles.bold}>{gangue_in_waste.toFixed(2)} tons</Text></Text>
                                                            <Text style={styles.text}>Quantity of valuable ore is <Text style={styles.bold}>{valuable_in_waste.toFixed(2)} tons</Text></Text>
                                                        </View>
                                                        <Text style={styles.text}>Mass balance around the concentrator is maintained.</Text>
                                                    </View>
                                                </View>
                                            </View>)
                                        })()
                                    }
                                </View>
                            </View>
                ) 
                })
            }
        </>
    )
}

const AuxilliaryComponents = ({currentNodeList}: {currentNodeList: singleObjectDataType[]})=> {
    return (
        <>
            {
                currentNodeList.map(currentNode => {
                    return (
                        <View style={styles.subsection} key={currentNode.id}> 
                            <View style={styles.subsection} wrap={false}>
                                <Text id={currentNode.oid} style={styles.title} break>
                                    {currentNode.label}
                                </Text>
                                 <View style={{...styles.imageContainer, minHeight: currentNode.object!.image_height}}>
                                    <Image src={currentNode.object?.image_url} style={{height: currentNode.object!.image_height, width: currentNode.object!.image_width}}/>
                                </View>
                                <View style={styles.subsection}>
                                    
                                    <Text style={styles.text}><Text style={styles.bold}>Auxilliary Component Type:</Text> {currentNode.object!.type} </Text>
                                    <Text style={styles.text}><Text style={styles.bold}>Auxilliary Component Name:</Text> {currentNode.object!.name} </Text>
                                    <Text style={styles.text}><Text style={styles.bold}>Description of operation: </Text><Text style={styles.desc}>
                                        {currentNode.description}
                                    </Text></Text>
                                </View>
                                {
                                        currentNode.object!.type === "ORE" ? (
                                            <View style={styles.subsection}>
                                                <Text style={styles.text}>Maximum Diameter of individual particle of Ore: <Text style={styles.bold}>{currentNode.properties.maxOreSize}</Text>mm</Text>
                                                <Text style={styles.text}>Grade of the Ore: <Text style={styles.bold}>{currentNode.properties.oreGrade}</Text></Text>
                                                <Text style={styles.text}>Quantity of the Ore: <Text style={styles.bold}>{currentNode.properties.oreQuantity}</Text> tons</Text>
                                            </View>

                                        ): ""
                                    }
                            </View>
                        </View>
                    )
                })
            }
        
        </>
    )
}

const ShapeComponents = ({currentNodeList}: {currentNodeList: singleObjectDataType[]}) => {
    return (
        <>
        {
            currentNodeList.map(currentNode => {
                if (currentNode.object_info.object_model_name === "Shape" && currentNode.object!.name !== "Line" && currentNode.object!.name !== "Text") {
                    return (
                        <View style={styles.subsection} key={currentNode.id}>
                            <View style={styles.subsection} wrap={false}>
                                <Text id={currentNode.oid} style={styles.title} break>
                                    {currentNode.label}
                                </Text>
                                <Text style={styles.text}><Text style={styles.bold}>Shape Type:</Text> {currentNode.object!.name} </Text>
                                <Text style={styles.text}><Text style={styles.bold}>Description of operation:</Text> <Text style={styles.desc}>
                                    {currentNode.description}
                                </Text>
                                </Text>
                                
                            </View>
                        </View>
                    )
                }
            })
        }
        
        </>
    )
}




export const Report = ({objectData}: {objectData: objectDataType}) => {

  return (
    <Document>
        <Page size="A4" style={styles.page}>
        {
            Object.keys(objectData).map(key=> {
                const currentNode = objectData[key]
                // console.log("current node ", currentNode)
                return <View style={styles.section} key={key}>
                            {
                                currentNode.object_info.object_model_name === "Crusher" ? (
                                    <>
                                        <Text style={styles.title} break>Crushing Component</Text>
                                        <View style={styles.subsection}>
                                            <Text style={styles.text}>
                                                <Text style={styles.bold}>Crusher Name: </Text>{currentNode.object!.name} 
                                            </Text>
                                            <Text style={styles.text}>
                                                <Text style={styles.bold}>Crusher Label:</Text>
                                                {currentNode.label}
                                            </Text>
                                            <Text style={styles.text}>
                                                <Text style={styles.bold}>Crusher Description:</Text> {currentNode.description}
                                            </Text>
                                            <Text style={styles.text}>The crusher component is used as a {currentNode.properties.crusherType} crusher in the design</Text>
                                            <Text style={styles.text}>The crusher component has a gape of size {currentNode.properties.gape} thus maximum Diameter of feed in which 80% passes is {(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</Text>
                                            <Text style={styles.text}>The crusher component has a set of size {currentNode.properties.set} thus maximum Diameter of product in which 80% passes is {(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</Text>
                                        </View>
                                    </> 
                                ): currentNode.object_info.object_model_name === "Grinder" ? (
                                        <>
                                            <Text  style={styles.title} break>Milling Component</Text>
                                            <View style={styles.subsection}>
                                                <Text style={styles.text}>
                                                    <Text style={styles.bold}>Milling Component Name:</Text> {currentNode.object!.name}
                                                </Text>
                                                <Text style={styles.text}>
                                                    <Text style={styles.bold}>Milling Component Label:</Text> {currentNode.label}
                                                </Text>
                                                <Text style={styles.text}>
                                                    <Text style={styles.bold}>Milling Component Description:</Text> {currentNode.description}
                                                </Text>
                                                <Text style={styles.text}>The milling component has a gape of size {currentNode.properties.gape} thus maximum Diameter of feed in which 80% passes is {(parseFloat(currentNode.properties.gape!) * 0.8).toFixed(2)}</Text>
                                                <Text style={styles.text}>The milling component has a set of size {currentNode.properties.set} thus maximum Diameter of product in which 80% passes is {(parseFloat(currentNode.properties.set!) * 0.8).toFixed(2)}</Text>
                                            </View>
                                        </>
                                ): currentNode.object_info.object_model_name === "Screener"  ? (
                                        <>
                                            <Text  style={styles.title} break>Screening Component</Text>
                                            <View style={styles.subsection}>
                                                <Text style={styles.text}><Text style={styles.bold}>Screener Name: </Text>{currentNode.object!.name}</Text>
                                                <Text style={styles.text}><Text style={styles.bold}>Screener Label: </Text>{currentNode.label}</Text>
                                                <Text style={styles.text}><Text style={styles.bold}>Screener Description: </Text>{currentNode.description}</Text>
                                                <Text style={styles.text}>The Screener component has an aperture of size {currentNode.properties.aperture}</Text>
                                            </View>
                                        </>
                                ): currentNode.object_info.object_model_name === "Auxilliary" ? (
                                        <>
                                            <Text  style={styles.title} break>{currentNode.object!.type === "ORE" ? "Ore Mass Component" : currentNode.object!.type === "OTHER " ? "Auxilliary Component": currentNode.object!.type + ' Component'}</Text>
                                            <View style={styles.subsection}> 
                                                <Text style={styles.text}><Text style={styles.bold}>Name: </Text>{currentNode.object!.name}</Text>
                                                <Text style={styles.text}><Text style={styles.bold}>Label:</Text> {currentNode.label}</Text>
                                                <Text style={styles.text}><Text style={styles.bold}>Description: </Text>{currentNode.description}</Text>
                                                {
                                                    currentNode.object!.type === "ORE" ? (
                                                        <>
                                                            <Text style={styles.text}>Maximum Diameter of individual particle of Ore: {currentNode.properties.maxOreSize}mm</Text>
                                                            <Text style={styles.text}>Grade of the Ore: {currentNode.properties.oreGrade}</Text>
                                                            <Text style={styles.text}>Quantity of the Ore: {currentNode.properties.oreQuantity}tons</Text>
                                                        </>

                                                    ): ""
                                                }
                                            </View>
                                        </>
                                ): currentNode.object_info.object_model_name === "Concentrator" ? ( 
                                    <>
                                        
                                        { (() => {
                                                const {
                                                    gangue_recoverable,
                                                    valuable_recoverable,
                                                    feed_quantity,
                                                    valuable_in_feed,
                                                    gangue_in_feed,
                                                    valuable_in_product,
                                                    gangue_in_product,
                                                    valuable_in_waste,
                                                    gangue_in_waste
                                                } = concentratorAnalysis(currentNode)
                                                return (
                                                    <>
                                                        <Text  style={styles.title} break>Concentrator Component</Text>
                                                        <View style={styles.subsection}>
                                                            <Text style={styles.text}><Text style={styles.bold}>Concentrator Component Name: </Text>{currentNode.object!.name}</Text> 
                                                            <Text style={styles.text}><Text style={styles.bold}>Concentrator Component Label: </Text>{currentNode.label}</Text>
                                                            <Text style={styles.text}><Text style={styles.bold}>Concentrator Component Description: </Text>{currentNode.description}</Text>
                                                            <Text style={styles.text}>Quantity of ore going through the concentrator is <Text style={styles.bold}>{feed_quantity} tons</Text></Text>
                                                            <Text style={styles.text}>Grade of ore going through the concentrator is <Text style={styles.bold}>{currentNode.properties.oreGrade}</Text></Text>
                                                            <Text style={styles.text}>Concentrator recovery (%) of valuable mineral is <Text style={styles.bold}>{valuable_recoverable}%</Text></Text>
                                                            <Text style={styles.text}>Concentrator recovery (%) of gangue is <Text style={styles.bold}>{gangue_recoverable}%</Text></Text>
                                                            <Text style={styles.subtitle}>Ore Recovery Analysis Carried out based on the component use.</Text>
                                                            <View style={styles.subsection}>
                                                                <Text style={styles.text}>Valuable ore (%) present in the feed going through the concentrator is <Text style={styles.bold}>{valuable_in_feed * 100}%</Text></Text>
                                                                <Text style={styles.text}>Gangue (%) present in the feed going through the concentrator is <Text style={styles.bold}>{gangue_in_feed * 100}%</Text></Text>
                                                                <Text style={styles.text}><Text style={styles.bold}>Concentrate</Text></Text>
                                                                <View style={styles.subsection}>
                                                                    <Text style={styles.text}>Quantity of valuable ore is <Text style={styles.bold}>{valuable_in_product.toFixed(2)} tons</Text></Text>
                                                                    <Text style={styles.text}>Quantity of gangue is <Text style={styles.bold}>{gangue_in_product.toFixed(2)} tons</Text></Text>
                                                                </View>
                                                                <Text style={styles.text}><Text style={styles.bold}>Waste</Text></Text>
                                                                <View style={styles.subsection}>
                                                                    <Text style={styles.text}>Quantity of gangue is <Text style={styles.bold}>{gangue_in_waste.toFixed(2)} tons</Text></Text>
                                                                    <Text style={styles.text}>Quantity of valuable ore is <Text style={styles.bold}>{valuable_in_waste.toFixed(2)} tons</Text></Text>
                                                                </View>
                                                            </View>

                                                        </View>
                                                    </>
                                                )
                                            })()
                                            
                                        }
                                    </>
                                    )
                                     : currentNode.object!.name !== "Text" ? (
                                        <>

                                            <Text  style={styles.title} break>{ currentNode.object!.name === "Line" ? "Connector Component" : "Shape Component"}</Text>
                                            <View style={styles.subsection}> 
                                                {currentNode.object!.name !== "Line" ? <Text style={styles.text}><Text style={styles.bold}>Name: </Text>{currentNode.object!.name}</Text> : ""}
                                                <Text style={styles.text}><Text style={styles.bold}>Label: </Text>{currentNode.label}</Text>
                                                <Text style={styles.text}><Text style={styles.bold}>Description: </Text>{currentNode.description}</Text>
                                                {
                                                    currentNode.object!.name === "Line" ? <>
                                                        { currentNode.properties.prevObject.length && objectData[currentNode.properties.prevObject[0]] ? 
                                                        <View>
                                                            <Text style={styles.subtitle}>From:</Text>
                                                            <View style={{padding: "10px 14px"}}>
                                                                <Text style={styles.text}><Text style={styles.bold}>Label: </Text>{objectData[currentNode.properties.prevObject[0]].label}</Text>
                                                                <Text style={styles.text}><Text style={styles.bold}>Name: </Text>{objectData[currentNode.properties.prevObject[0]].object_info.object_model_name}</Text>
                                                            </View>
                                                        </View> : ""}
                                                        { currentNode.properties.nextObject.length && objectData[currentNode.properties.nextObject[0]] ? 
                                                        <View>
                                                            <Text style={styles.subtitle}>To:</Text>
                                                            <View style={{padding: "10px 14px"}}>
                                                                <Text style={styles.text}><Text style={styles.bold}>Label: </Text>{objectData[currentNode.properties.nextObject[0]].label}</Text>
                                                                <Text style={styles.text}><Text style={styles.bold}>Name: </Text>{objectData[currentNode.properties.nextObject[0]].object_info.object_model_name}</Text>
                                                            </View>
                                                        </View> : ""}
                                                    </>: ""
                                                }
                                            </View>
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


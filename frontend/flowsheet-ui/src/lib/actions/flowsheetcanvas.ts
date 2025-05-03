"use server"

import { cookies } from "next/headers"
import { redirect} from "next/navigation"
import { objectDataType, objectCoords } from "@/components/context/FlowsheetProvider"
import { getAccessToken } from "../utils/requestAccessToken"
import { saveFreqType } from "@/components/FlowsheetLayout/FlowsheetHeader"


export type objectCompatibleTypes = {
    [key: string]: {
      id?: number,
      oid: string,
      label: string,
      flowsheet: string,
      x_coordinate: number,
      y_coordinate: number,
      scale: number,
      font_size: number,
      description: string,
      object_info: {
        object_model_name: string,
        object_id: string
      } | string,
      properties: {
        nextObject: string[],
        prevObject: string[],
        coordinates: objectCoords
      } | string
    }
  }
  

const BASE_URL = "http://localhost:8000"



export async function uploadObject(object: objectDataType, flowsheetID: string, update: boolean) {
        const listObjects = []
        const accessToken = await getAccessToken()


        try {
            const newObject: objectCompatibleTypes = JSON.parse(JSON.stringify(object))
            for (const key in object) {
                newObject[key].properties = JSON.stringify(object[key].properties)
                newObject[key].object_info = JSON.stringify(object[key].object_info)
                listObjects.push(newObject[key])
            }
            if (listObjects.length === 0)
                return {}
            let response
            if (update) {
                response = await fetch(`${BASE_URL}/flowsheet_objects/${flowsheetID}/update`, {
                    method: "PUT",
                    body: JSON.stringify(listObjects),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                })
            } else {
                response = await fetch(`${BASE_URL}/flowsheet_objects/${flowsheetID}`, {
                    method: "POST",
                    body: JSON.stringify(listObjects),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                })
            }

            
            const result = await response.json()
            
            if (response.status  === 201 || response.status === 200) {
                const objects: objectDataType = {}
                for (const entry of result) {
                    const object_info = {
                        object_model_name: entry.object.model_name,
                        object_id: entry.object.id
                    }
                    entry["object_info"] = object_info
                    entry.properties = JSON.parse(entry.properties)
                    entry.x_coordinate = parseFloat(entry.x_coordinate)
                    entry.y_coordinate = parseFloat(entry.y_coordinate)
                    entry.scale = parseFloat(entry.scale)
                    entry.font_size = parseFloat(entry.font_size)
                    objects[entry.oid] = entry
                }
                // console.log("objects", objects)
                return objects
            } else {
                console.log("result", result)
                return {}
            }
        } catch (err) {
            console.log(err)
            return {}
        }
        // return {}

}

export async function loadObjects(flowsheetID: string) {
    const accessToken = await getAccessToken()

    // const start = performance.now()
    try {
        
        const response = await fetch(`${BASE_URL}/flowsheet_objects/${flowsheetID}`, {
            cache: "no-store",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })

        const result = await response.json()
        // const end = performance.now()
        // const responseTime = end - start;
        // console.log(`API Response time: ${responseTime} milliseconds`);
    
        if (response.status === 200) {
            const objects: objectDataType = {}
            for (const entry of result) {
                const object_info = {
                    object_model_name: entry.object.model_name,
                    object_id: entry.object.id
                }
                entry["object_info"] = object_info
                entry.properties = JSON.parse(entry.properties)
                entry.x_coordinate = parseFloat(entry.x_coordinate)
                entry.y_coordinate = parseFloat(entry.y_coordinate)
                entry.scale = parseFloat(entry.scale)
                entry.font_size = parseFloat(entry.font_size)
                objects[entry.oid] = entry
                
            }
            return objects
        } else if (response.status === 404) {
            return {notFound: "error"}
        }else {
            console.log("console.log", result)
            return {error: "error occured while loading data"}

        }

    } catch(err) {
        console.log(err)
        return {error: "error occured while loading data"}
    }

    // return {}
}


export async function saveSettings(flowsheetID: string, projectID: string, settings: saveFreqType) {
    const accessToken = await getAccessToken()
    try {
        const response = await fetch(`${BASE_URL}/flowsheets/${projectID}/update/${flowsheetID}`, {
            method: "PATCH",
            body: JSON.stringify({
                save_frequency: settings.saveInterval,
                save_frequency_type: settings.frequencyType
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        })
        const result = await response.json()
        console.log('result here', result)
        if (response.status === 200) return {success: true}
        else return {error: "error occured while saving settings"}
    } catch (err) {
        console.log(err)
        return {error: "error occured while saving settings"}
    }
}
"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { resolve } from "path"
import { objectDataType, objectCoords } from "@/components/context/ProjectProvider"


export type objectCompatibleTypes = {
    [key: string]: {
      id?: number,
      oid: string,
      label: string,
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



export async function uploadObject(object: objectDataType, projectId: string, update: boolean) {
        const listObjects = []
        const accessToken = cookies().get("access")?.value
        const refreshToken = cookies().get("refresh")?.value
        if (!accessToken && !refreshToken)
            return redirect("/login")

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
                response = await fetch(`${BASE_URL}/project_objects/${projectId}/update`, {
                    method: "PUT",
                    body: JSON.stringify(listObjects),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                })
            } else {
                response = await fetch(`${BASE_URL}/project_objects/${projectId}`, {
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
                console.log(result)
                return {}
            }
        } catch (err) {
            console.log(err)
            return {}
        }

}

export async function loadObjects(projectId: string) {
    const accessToken = cookies().get("access")?.value
    const refreshToken = cookies().get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")

    try {
        
        const response = await fetch(`${BASE_URL}/project_objects/${projectId}`, {
            cache: "no-store",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        // console.log("result", response)
        const result = await response.json()
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
            // console.log("objects", objects)
            return objects
        } else {
            console.log(result)
            return {error: "error occured while loading data"}

        }

    } catch(err) {
        console.log(err)
        return {error: "error occured while loading data"}
    }
}
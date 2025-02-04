"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { resolve } from "path"
import { getAccessToken } from "../utils/requestAccessToken"

const BASE_URL = "http://localhost:8000"



export async function fetchFlowsheet(projectId: string, flowsheet_id: string) {
    const accessToken = await getAccessToken()

    
    try {

        const response = await fetch(`${BASE_URL}/flowsheets/${projectId}/update/${flowsheet_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        // console.log(response, response.text)
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        console.log(err)
        return null
    }
}



export async function createFlowsheet(prevState: any, formData: FormData) {
    const accessToken = await getAccessToken()
    const flowsheetName = (formData.get('name') as string).trim()
    const flowsheetDescription = (formData.get('description') as string).trim()
    const projectId = (formData.get("projectId") as string).trim()
    const flowsheetFootprint = (formData.get("flowsheetFootprint") as string).trim()
    if (flowsheetName.length === 0 || flowsheetDescription.length === 0 ) 
        return {detail: "Flowsheet Name and Description are required"}
    if (!projectId) throw "An error occured"

    const data = {
        name: flowsheetName,
        description: flowsheetDescription,
        footprint: flowsheetFootprint
    }
    // console.log("data going through", data)

    try {

        // return {detail: "development in progress"}
        const response = await fetch(`${BASE_URL}/flowsheets/${projectId}`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        console.log("created result", result)
        if (response.status === 201) {
            revalidatePath(`/project/${projectId}`)
            return {success: "Created Successfully", result}
        } else {
            return {error: "An error occured"}
        }
        

    } catch (err) {
        
        if (err instanceof Error)
            return {error: err.message}
        else
            return {error: "Unable to create project"}
    }
    // redirect("/login")

}
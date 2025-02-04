"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { resolve } from "path"
import { getAccessToken } from "../utils/requestAccessToken"

const BASE_URL = "http://localhost:8000"

export async function createProject(prevState: any, formData: FormData) {
    const accessToken = await getAccessToken()
    const projectName: string = (formData.get('name') as string).trim()
    const projectDescription: string = (formData.get('description') as string).trim()
    if (projectName.length === 0 || projectDescription.length === 0 ) 
        return {detail: "Project Name and Description are required"}
    const data = {
        name: projectName,
        description: projectDescription
    }

    try {

        const response = await fetch(`${BASE_URL}/projects/`, {
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
            revalidatePath("/projects")
            return {success: "Created Successfully", result}
        } else if(response.status === 401) {
            cookies().delete("refresh")
            cookies().delete("access")
        } else {
            return {error: "An error occured"}
        }
        

    } catch (err) {
        
        if (err instanceof Error)
            return {error: err.message}
        else
            return {error: "Unable to create project"}
    }
    redirect("/login")

}



export async function fetchProject(projectId: string) {
    const accessToken = await getAccessToken()


    
    try {

        const response = await fetch(`${BASE_URL}/projects/${projectId}`, {
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
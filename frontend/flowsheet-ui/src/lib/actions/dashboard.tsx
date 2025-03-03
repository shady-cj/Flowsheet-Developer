"use server"

import { fetchedFlowsheetsType, fetchedProjectType } from "@/components/DashboardLayout/DashboardPageRenderer"
// import { revalidatePath } from "next/cache"
// import { cookies } from "next/headers"
// import { notFound, redirect } from "next/navigation"
// import { resolve } from "path"
import { getAccessToken } from "../utils/requestAccessToken"

const BASE_URL = "http://localhost:8000"



export const fetchDashboardProjects = async (query: string | null, limit?: number) => {
    const accessToken = await getAccessToken()
    
    try {
        const endpoint = query ? `${BASE_URL}/projects/?f=${query}${limit ? "&limit="+limit : ""}` : `${BASE_URL}/projects/${limit ? "?limit="+limit : ""}`
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        console.log("result", result)
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        console.log("error fetching dashboard projects", err)
        return null
    }
}

export const fetchDashboardFlowsheets = async (query: string | null, limit?: number) => {
    const accessToken = await getAccessToken()
    
    try {
        const endpoint = query ? `${BASE_URL}/flowsheets/?f=${query}${limit ? "&limit="+limit : ""}` : `${BASE_URL}/flowsheets/${limit ? "?limit="+limit : ""}`
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        console.log("flowsheet result", result)
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        console.log("error fetching dashboard flowsheets", err)
        return null
    }
}


export const updateProject = async (item: fetchedProjectType) => {
    const accessToken = await getAccessToken()

    try {
        const endpoint = `${BASE_URL}/projects/${item.id}`
        const response = await fetch(endpoint, {
            method: "PUT",
            body: JSON.stringify(item),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        console.log("project update result", result)
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        console.log("error updating flowsheets", err)
        return null
    }
}

export const updateFlowsheet = async (item: fetchedFlowsheetsType) => {
    const accessToken = await getAccessToken()

    try {
        const endpoint = `${BASE_URL}/flowsheets/${item.project}/update/${item.id}`
        const response = await fetch(endpoint, {
            method: "PUT",
            body: JSON.stringify(item),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        console.log("flowsheet update result", result)
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        console.log("error updating flowsheets", err)
        return null
    }
}
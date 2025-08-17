"use server"

import { editType, fetchedFlowsheetsType, fetchedProjectType } from "@/components/DashboardLayout/DashboardPageRenderer"
// import { revalidatePath } from "next/cache"
// import { cookies } from "next/headers"
// import { notFound, redirect } from "next/navigation"
// import { resolve } from "path"
import { getAccessToken } from "../utils/requestAccessToken"

const BASE_URL = process.env.API_URL as string 
// console.log("BASE_URL", BASE_URL)




export const fetchDashboardProjects = async (query: string | null, limit?: number, page?: number) => {
    const accessToken = await getAccessToken()
    
    try {
        const offset = ((page || page === 0) && limit) ? page * limit : null
         const paginate = limit && (offset === 0 || offset) ? true : false
        const endpoint = query ? `${BASE_URL}/projects/?f=${query}${paginate ? "&offset="+offset+"&limit="+limit : ""}` : `${BASE_URL}/projects/${paginate ? "?offset="+offset+"&limit="+limit : ""}`
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

export const fetchDashboardFlowsheets = async (query: string | null, limit?: number, page?: number) => {
    const accessToken = await getAccessToken()
    
    try {
        const offset = ((page || page === 0) && limit) ? page * limit : null
        const paginate = limit && (offset === 0 || offset) ? true : false
        const endpoint = query ? `${BASE_URL}/flowsheets/?f=${query}${paginate ? "&offset="+offset+"&limit="+limit: ""}` : `${BASE_URL}/flowsheets/${paginate ? "?offset="+offset+"&limit="+limit : ""}`
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        // console.log("flowsheet ---- result", result)
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



export const deleteEntity = async (projectId: string, type: "project" | "flowsheet", flowsheetId?: string) => {
    const accessToken = await getAccessToken()
    try{
        let endpoint = BASE_URL
        if (type === "project") {
            endpoint += `/projects/${projectId}`
        } else {
            endpoint += `/flowsheets/${projectId}/update/${flowsheetId}`
        }
        const response = await fetch(endpoint, {
            method: "DELETE", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        })
        if (response.status === 204){
            return {"message": `${type} deleted successfully`, success: true}
        } 
        throw Error(`Error deleting ${type}`)

    } catch (err) {
        console.log("error deleting",  err)
        return {"message": `Error deleting ${type}`}
    }
}



export const editEntity = async (editData: editType) => {
    const accessToken = await getAccessToken()
    try{
        let endpoint = BASE_URL
        if (editData.title === "Project") {
            endpoint += `/projects/${editData.projectId}`
        } else {
            endpoint += `/flowsheets/${editData.projectId}/update/${editData.flowsheetId}`
        }
        const response = await fetch(endpoint, {
            method: "PATCH", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }, 
            body: JSON.stringify({name: editData.name, description: editData.description})
        })
        const result = await response.json()
        console.log("result", result)
        if (response.status === 200) {
            return {
                success: true,
                message: `${editData.title} edited successfully`
            }
        } else {
            return {
                success: false,
                message: "Something went wrong and data wasn't updated"
            }
        }
    } catch (err) {
        console.log("error editing",  err)
        return {"message": `Error editing ${editData.title}, data wasn't updated`}
    }
}



export const dashboardSearch = async (query: string) => {
    const accessToken = await getAccessToken()

    try {
        const endpoint = `${BASE_URL}/dashboard_search/?q=${query}`
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        console.log("search results", result)
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        console.log("error searching for query", query, err)
        return null
    }
}




export const sendFeedback = async (formData: FormData) => {
    const accessToken = await getAccessToken()
    // console.log("form data", formData)
    try {
        console.log("form data", formData)
        const response = await fetch(`${BASE_URL}/feedbacks/`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })

        const result = await response.json()
        if (response.status === 200) return result
        else {
            console.log(result);
            return null
        }
    } catch (err) {
        // console.log('too many file')
        console.log(err)
        return null
    }
}

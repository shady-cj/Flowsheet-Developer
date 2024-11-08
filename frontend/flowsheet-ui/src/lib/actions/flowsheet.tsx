"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { resolve } from "path"

const BASE_URL = "http://localhost:8000"



export async function fetchFlowsheet(projectId: string, flowsheet_id: string) {
    const accessToken = cookies().get("access")?.value
    const refreshToken = cookies().get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")

    
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
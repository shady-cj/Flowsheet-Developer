"use server";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";

const BASE_URL = "http://localhost:8000"
export async function fetchObjects(objectEndpoint: string) {
    const accessToken = cookies().get("access")?.value
    const refreshToken = cookies().get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")

    try {
        const response = await fetch(`${BASE_URL}/${objectEndpoint}/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        if (response.status === 200)
            return await response.json()
        else return []
        
    } catch(err) {
        return []
    }
    
}
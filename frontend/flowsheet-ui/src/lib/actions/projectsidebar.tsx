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

export async function createCustomComponent(formData: FormData, category: string) {
    const accessToken = cookies().get("access")?.value
    const refreshToken = cookies().get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")

    
    try {
        let url = ""
        switch (category) {
            case "crusher":
                url = "crushers"
                break;
            case "screener":
                url = "screeners"
                break;
            case "grinder":
                url = "grinders"
                break;
            case "auxilliary":
                url = "auxilliary"
                break;
            default:
                url = "crushers"
        }
        
        formData.append("folder", url)
        // const objectData: {name: string, image: File} = {} as {name: string, image: File};
        
        // formData.forEach(function(value: string | File, key){
        //     objectData[key] = value;
        // });

        const response = await fetch(`${BASE_URL}/${url}/`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        const result = await response.json()
        console.log(result)
        if (response.status === 201) {
            return {success: "Custom component created succesfully"};

        } else {
            return {error: "Error, could not create component"};
        }
    } catch (err) {
        console.log(err)
        return {error: "An error occured"};
    }

}
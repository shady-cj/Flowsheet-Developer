"use server";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { getAccessToken } from "../utils/requestAccessToken";

const BASE_URL = "http://localhost:8000"


export async function fetchObjects(objectEndpoint: string) {
    const accessToken = await getAccessToken()


    try {
        const response = await fetch(`${BASE_URL}/${objectEndpoint}/`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
  
        if (response.status === 200){
            const result = await response.json()
            // const end = performance.now()
            // const responseTime = end - start;
            // console.log(`Response time: ${responseTime} milliseconds`);
            return result
           
        }
         
        else return []
        
    } catch(err) {
        return []
    }
    
}

export async function createCustomComponent(formData: FormData, category: string) {
    const accessToken = await getAccessToken()

    
    console.log(formData, "formData")
    
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
            case "concentrator":
                url = "concentrators"
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
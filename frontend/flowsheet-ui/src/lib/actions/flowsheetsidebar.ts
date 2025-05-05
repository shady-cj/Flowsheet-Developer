"use server";
import { cookies } from "next/headers"
import { redirect } from "next/navigation";
import { getAccessToken } from "../utils/requestAccessToken";

const BASE_URL = process.env.API_URL as string 


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
    
    try {
        formData.append("folder", category)
        // const objectData: {name: string, image: File} = {} as {name: string, image: File};
        
        // formData.forEach(function(value: string | File, key){
        //     objectData[key] = value;
        // });

        const response = await fetch(`${BASE_URL}/${category}/`, {
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

export async function removeObject(objectId: string, objectType: string) {
    const accessToken = await getAccessToken()

    try {
        const endpoint = `${BASE_URL}/flowsheet_objects/destroy/`
        const response = await fetch(endpoint, {
            method: "DELETE",
            body: JSON.stringify({
                objectId,
                objectType
            }),
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }

        })
        
        if (response.status === 204) {
            console.log('success')
            return {"message": "Object was deleted successfully", success: true}
        } else if (response.status === 200) {
            const result = await response.json()
            return result
        } 
        return {"message": "something went wrong"}

    } catch (err) {
        console.log(err)
        return {error: "An error occured"}
    }
}
"use server"
// import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { MouseEvent } from 'react'
import { getAccessToken, storeTokens } from '../utils/requestAccessToken'
// import { NextResponse } from 'next/server'

const BASE_URL = process.env.API_URL as string 
const HOST_URL = process.env.BASE_URL as string
// console.log("BASE_URL", BASE_URL)



export async function login(prevState: any, formData:FormData) {
    const email: string = (formData.get("email") as string).trim()
    const password: string = (formData.get("password") as string).trim()

    if (email.length == 0 || password.length == 0) {
        return {detail: "All fields are required"}
    }
    const details = {
        email, password
    }
    try {

        const response = await fetch(`${BASE_URL}/auth/token/`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (response.status == 200) {
            const access_token = data.access 
            const refresh_token = data.refresh 
            await storeTokens(access_token, refresh_token)
            return {success: "Login Succesful"}
        } else {
            return {error: "Invalid Credentials"}
        }
        
    } catch(err) {
        if (err instanceof Error)
            return {error: "Sorry!, An error occured"}
        else
            return {error: "Something went wrong"}
    }
   
}

export async function oauthSignin(payload: {email: string, provider: string}) {
    try {

        const response = await fetch(`${BASE_URL}/auth/oauth-auth/`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (response.status == 200) {
            const access_token = data.access 
            const refresh_token = data.refresh 
            await storeTokens(access_token, refresh_token)
            return {success: "Login Succesful"}
        } else if (response.status == 401) {
            return data
        }
    } catch (err) {
        if (err instanceof Error)
            return {error: "Sorry!, An error occured"}
        else
            return {error: "Something went wrong"}
    }
}

export async function register(prevState: any, formData: FormData) {
    const email: string = (formData.get("email") as string).trim()
    const password: string = (formData.get("password") as string).trim()
    const confirmPassword: string = (formData.get("confirm_password") as string).trim()

    if (email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
        return {detail: "All fields are required"}
    }
    if (password.length < 8)
        return {detail: "Password must be greater than 8 characters in length"}
    if (password !== confirmPassword)
        return {detail: "Passwords must match"}
    const details = {
        email, password
    }

    try {

        const response = await fetch(`${BASE_URL}/auth/register/`, {
            method: "POST",
            body: JSON.stringify(details),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (response.status === 201) {
            return {success: "Account Registration Successful"}

        } else if(response.status === 400) {
            if (data.email)
                return {error: data.email[0]}
        } else {
            return {error: "Sorry! we couldn't create an account"}
        }
        
    } catch(err) {
        if (err instanceof Error)
            return {error: "Sorry!, an error occured"}
        else
            return {error: "Something went wrong"}
    }

}


export async function logout() {
    const cookie = await cookies()
    cookie.delete("access")
    cookie.delete("refresh")
    redirect("/")
}


export async function fetchUser() {
    const accessToken = await getAccessToken()

    
    try {

        const response = await fetch(`${BASE_URL}/auth/user`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }

        })
        const result = await response.json()
        if (response.status === 200) return result
        else {
            // console.log(result);
            return null
        }
    } catch (err) {
        // console.log(err)
        return null
    }
}

export async function passwordReset (prevState: any, formData:FormData) {
    const email: string = (formData.get("email") as string).trim()
    if (email.length == 0) {
        return {detail: "Provide an email"}
    }

        try {

        const response = await fetch(`${BASE_URL}/auth/request-password-reset/`, {
            method: "POST",
            body: JSON.stringify({email, host: HOST_URL}),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (response.status == 200) {

            return {success: data.message}
        } else {
            return {error: data.error || "Something went wrong"}
        }
        
    } catch(err) {
        if (err instanceof Error)
            return {error: "Sorry!, An error occured"}
        else
            return {error: "Something went wrong"}
    }
   
}

export async function passwordChange(formState: {new_password: string, confirm_password: string, email: string, token: string}) {

    try {
        const response = await fetch(`${BASE_URL}/auth/password-reset/`, {
            method: "POST",
            body: JSON.stringify(formState),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const data = await response.json()

        if (response.status == 200) {
            return {success: data.message}
        } else {
            return {error: data.error || "Something went wrong"}
        }

    } catch(err) {
        if (err instanceof Error)
            return {error: "Sorry!, An error occured"}
        else
            return {error: "Something went wrong"}
    }  
}
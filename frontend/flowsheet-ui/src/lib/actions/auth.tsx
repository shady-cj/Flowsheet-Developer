"use server"
// import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { MouseEvent } from 'react'
// import { NextResponse } from 'next/server'

const BASE_URL = "http://localhost:8000"


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
            cookies().set("access", access_token, {
                expires: new Date(Date.now() + (60 * 59 * 1000)),
                httpOnly: true,
                secure: true,
                path: "/"
            })

            cookies().set("refresh", refresh_token, {
                expires: new Date(Date.now() + (23 * 60 * 60 * 1000)),
                httpOnly: true,
                secure: true,
                path: "/"
            })
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
    cookies().delete("access")
    cookies().delete("refresh")
    redirect("/")
}


export async function fetchUser() {
    const accessToken = cookies().get("access")?.value
    const refreshToken = cookies().get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")

    
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
            console.log(result);
            return null
        }
    } catch (err) {
        console.log(err)
        return null
    }
}
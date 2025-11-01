"use server"

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';
const BaseURL = process.env.API_URL as string 
const ENV = process.env.ENV as string



export const requestAccessToken = async (refreshToken: string) => {
    const cookie = await cookies()
    if (refreshToken) {
        let accessToken;
        try {
            const response = await fetch(`${BaseURL}/auth/token/refresh/`, {
                method: 'POST',
                body: JSON.stringify({
                    refresh: refreshToken
                }),
                headers: {"Content-Type": "application/json"}
            })

            const data = await response.json()
            
            accessToken = data.access
            const newRefreshToken = data.refresh
            storeTokens(accessToken, newRefreshToken)
            return accessToken
        } catch (err) {
            // console.log("error")
            cookie.delete("access")
            cookie.delete("refresh")
            redirect("/login")
        }
            
    }
}

export const getAccessToken = async () => {
    const cookie = await cookies()
    let accessToken = cookie.get("access")?.value
    const refreshToken = cookie.get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")
    if (!accessToken && refreshToken)
        accessToken = await requestAccessToken(refreshToken);
    return accessToken;
}



export const storeTokens = async (access_token: string, refresh_token: string, serverResponse?: NextResponse) => {
    const cookie = await (serverResponse ? serverResponse.cookies : cookies())
    cookie.set("access", access_token, {
        expires: new Date(Date.now() + (60 * 59 * 1000)),
        httpOnly: true,
        secure: ENV === 'PRODUCTION' ? true : false,
        path: "/",
    })

    cookie.set("refresh", refresh_token, {
        expires: new Date(Date.now() + (23 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: ENV === 'PRODUCTION' ? true : false,
        path: "/",
    })
}
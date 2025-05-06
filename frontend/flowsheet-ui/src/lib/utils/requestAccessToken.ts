import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';
const BaseURL = process.env.API_URL as string 



export const requestAccessToken = async (refreshToken: string) => {
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
            cookies().delete("access")
            cookies().delete("refresh")
            redirect("/login")
        }
            
    }
}

export const getAccessToken = async () => {
    let accessToken = cookies().get("access")?.value
    const refreshToken = cookies().get("refresh")?.value
    if (!accessToken && !refreshToken)
        return redirect("/login")
    if (!accessToken && refreshToken)
        accessToken = await requestAccessToken(refreshToken);
    return accessToken;
}



export const storeTokens = (access_token: string, refresh_token: string, serverResponse?: NextResponse) => {
    const cookie = serverResponse ? serverResponse.cookies : cookies() 
    cookie.set("access", access_token, {
        expires: new Date(Date.now() + (60 * 59 * 1000)),
        httpOnly: true,
        secure: true,
        path: "/"
    })

    cookie.set("refresh", refresh_token, {
        expires: new Date(Date.now() + (23 * 60 * 60 * 1000)),
        httpOnly: true,
        secure: true,
        path: "/"
    })
}
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
const BaseURL = "http://localhost:8000"



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
            cookies().set("access", accessToken, {
                expires: new Date(Date.now() + (60 * 59 * 1000)),
                httpOnly: true,
                secure: true,
                path: "/"
            })
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
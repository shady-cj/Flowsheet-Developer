import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
const BaseURL = "http://localhost:8000"
 
const unauthenticated_routes = ["/", "/login", "/register"]
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const accessToken = request.cookies.get("access")?.value
    const refreshToken = request.cookies.get("refresh")?.value
    const serverResponse = NextResponse.next()
    if (!accessToken && refreshToken) {
        try {
            const response = await fetch(`${BaseURL}/auth/token/refresh/`, {
                method: 'POST',
                body: JSON.stringify({
                    refresh: refreshToken
                }),
                headers: {"Content-Type": "application/json"}
            })

            const data = await response.json()

            const accessToken = data.access
  

            serverResponse.cookies.set("access", accessToken, {
                expires: new Date(Date.now() + (60 * 59 * 1000)),
                httpOnly: true,
                secure: true,
                path: "/"
            })
        } catch (err) {
            serverResponse.cookies.delete("access")
            serverResponse.cookies.delete("refresh")
            return NextResponse.redirect(new URL("/login", request.url))
        }
        
    }
   
    if (unauthenticated_routes.includes(path) && accessToken && refreshToken) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (!unauthenticated_routes.includes(path) && !accessToken && !refreshToken) {
        const LoginUrl = new URL("/login", request.url)
        LoginUrl.searchParams.set("nextURL", path)
        return NextResponse.redirect(LoginUrl)
    }
    return serverResponse
}


export const config = {
    matcher: ["/", "/login", "/register", "/dashboard"]
}
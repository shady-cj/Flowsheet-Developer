import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { storeTokens } from './lib/utils/requestAccessToken'
const BaseURL = "http://localhost:8000"
 
const unauthenticated_routes = ["/", "/login", "/register"]
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    let accessToken = request.cookies.get("access")?.value as string
    let refreshToken  = request.cookies.get("refresh")?.value as string
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
            
            accessToken = data.access
            refreshToken = data.refresh
  

            await storeTokens(accessToken, refreshToken, serverResponse)
        } catch (err) {
            // console.log("error")
            const redirectLogin = NextResponse.redirect(new URL("/login", request.url))
            redirectLogin.cookies.delete("access")
            redirectLogin.cookies.delete("refresh")
            return redirectLogin
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
    matcher: [
        { 
        source: '/((?!api|_next/static|_next/image|favicon.ico|.*jpg|.*jpeg).*)',
        missing: [
            // Exclude Server Actions
            { type: 'header', key: 'next-action' },
            ],
        }],
    
}
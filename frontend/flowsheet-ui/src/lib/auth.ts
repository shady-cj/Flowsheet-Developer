"use server"
import GoogleProvider from 'next-auth/providers/google'
import { oauthSignin } from './actions/auth'
const nextAuthConfig = {    
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
           
            
        }),
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            const email = user.email
            const provider = account.provider
            // console.log("details", email, provider)
            const response = await oauthSignin({email, provider})
            // console.log(response)
            if (response.error) {
                 return `/login?error=${encodeURIComponent(response.error || 'Authentication failed')}`
            }
            return true
          },
      }
}





export { nextAuthConfig }

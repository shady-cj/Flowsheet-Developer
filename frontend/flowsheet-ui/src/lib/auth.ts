import GoogleProvider from 'next-auth/providers/google'
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
        async signIn({ user, account, profile, email, credentials }: any) {
            console.log("user signin", user, account, profile, email, credentials)
            return true
          },
        async jwt({ token, user, account, profile, isNewUser }: any) {
            console.log("jwt", token, user, account, profile, isNewUser)
            return token
          }
      }
}

export { nextAuthConfig }

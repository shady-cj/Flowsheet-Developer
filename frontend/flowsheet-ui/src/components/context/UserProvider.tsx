"use client"
import { fetchUser } from "@/lib/actions/auth"
import {createContext, useEffect, useState} from "react"



export type userType = {
  id: string, 
  email: string,
//   projects: {id: string, name: string, description: string, creator: string}[]
} | null

type userContextType = {
    user: userType, 
    loadingUser: boolean
}

export const USER_CACHE_KEY = "activeUser"
const USER_CACHE_TTL = 60 * 59 * 1000 // 60 minutes



export const UserContext = createContext<userContextType>(null!)


export const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<userType | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);

    useEffect(() => {
        const getUser = async () => {
            const response = await fetchUser()
            setUser(response)
            setLoadingUser(false)
             // Save to cache


            if (response) {

                localStorage.setItem(
                    USER_CACHE_KEY,
                    JSON.stringify({ data: response, timestamp: Date.now() })
                )
            } else {
                localStorage.removeItem(USER_CACHE_KEY)
            }
        }

        const cached = localStorage.getItem(USER_CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)

          // If cache still valid
          if ((Date.now() - timestamp) < USER_CACHE_TTL) {
            setUser(data)
            setLoadingUser(false)
            return
          }
        }

        getUser()
        

    }, [])
    

    return <UserContext.Provider value={{user, loadingUser}}>
        {children}
    </UserContext.Provider>
}
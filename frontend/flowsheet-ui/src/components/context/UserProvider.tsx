"use client"
import { fetchUser } from "@/lib/actions/auth"
import {createContext, useEffect, useState} from "react"



export type userType = {
  id: string, 
  email: string,
  projects: {id: string, name: string, description: string, creator: string}[]
} | null

type userContextType = {
    user: userType, 
    loadingUser: boolean
}

export const UserContext = createContext<userContextType>(null!)


export const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<userType | null>(null);
    const [loadingUser, setLoadingUser] = useState<boolean>(true);

    useEffect(() => {
        const getUser = async () => {
            const response = await fetchUser()
            setUser(response)
            setLoadingUser(false)
        }
        getUser()
    }, [])
    

    return <UserContext.Provider value={{user, loadingUser}}>
        {children}
    </UserContext.Provider>
}
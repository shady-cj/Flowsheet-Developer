"use client"
import { fetchUser } from "@/lib/actions/auth"
import {createContext, useEffect, useState} from "react"



type userType = {
    id: string,
    email: string,
    projects: string[]
}

type userContextType = {
    user: userType | null
}

export const UserContext = createContext<userContextType>(null!)


export const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<userType | null>(null);
    
    useEffect(() => {
        const getUser = async () => {
            const response = await fetchUser()
            setUser(response)
        }
        getUser()
    }, [])
    

    return <UserContext.Provider value={{user}}>
        {children}
    </UserContext.Provider>
}
import { UserProvider } from "@/components/context/UserProvider"

const Layout = ({children}: {children: React.ReactNode}) => {

    return <UserProvider>
      {children}   
     </UserProvider>
}

export default Layout


import { UserProvider } from "@/components/context/UserProvider"

const Layout = ({children, params}: {children: React.ReactNode, params: {id: string}}) => {
  return (
    <UserProvider>
      <div className="select-none flex flex-col h-screen">

          <section className="grow-0 shrink-0 basis-auto h-[100vh] flex">
              {children}
          </section>
      </div>
    </UserProvider>
  

  
  )
}

export default Layout

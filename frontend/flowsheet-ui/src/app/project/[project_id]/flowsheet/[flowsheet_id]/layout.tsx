
import FlowsheetProvider from "@/components/context/FlowsheetProvider"

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <FlowsheetProvider>
      <div className="select-none h-screen">

          <section className="w-screen h-full flex">
              {children}
          </section>
      </div>
    </FlowsheetProvider>

  
  )
}

export default Layout

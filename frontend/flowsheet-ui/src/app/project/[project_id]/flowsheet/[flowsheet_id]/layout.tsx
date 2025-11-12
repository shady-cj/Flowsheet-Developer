
import FlowsheetProvider from "@/components/context/FlowsheetProvider"

const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <FlowsheetProvider>
      <div className="select-none w-full overflow-hidden h-screen">

          <section className="w-full h-full flex">
              {children}
          </section>
      </div>
    </FlowsheetProvider>

  
  )
}

export default Layout

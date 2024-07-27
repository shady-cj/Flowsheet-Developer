import ProjectHeader from "@/components/ProjectLayout/ProjectHeader"
import ProjectProvider from "@/components/context/ProjectProvider"

const Layout = ({children, params}: {children: React.ReactNode, params: {id: string}}) => {
  return (
    <ProjectProvider>
      <div className="select-none flex flex-col h-screen">
          <ProjectHeader params={params} />
          <section className="grow-0 shrink-0 basis-auto h-[80vh] flex">
              {children}
          </section>
      </div>
    </ProjectProvider>

  
  )
}

export default Layout

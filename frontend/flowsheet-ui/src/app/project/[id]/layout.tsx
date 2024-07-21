import ProjectHeader from "@/components/ProjectLayout/ProjectHeader"

const Layout = ({children, params}: {children: React.ReactNode, params: {id: string}}) => {
  return (
    <div className="select-none flex flex-col h-screen">
        <ProjectHeader />
        <section className="grow-0 shrink-0 basis-auto h-[80vh] flex">
            {children}
        </section>
    </div>
  
  )
}

export default Layout

import ProjectHeader from "@/components/ProjectLayout/ProjectHeader"

const Layout = ({children, params}: {children: React.ReactNode, params: {id: string}}) => {
  return (
    <div className="select-none">
        <ProjectHeader />
        <section className="flex-auto flex">
            {children}
        </section>
    </div>
  
  )
}

export default Layout

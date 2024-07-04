import ProjectHeader from "@/components/ProjectLayout/ProjectHeader"

const Layout = ({children, params}: {children: React.ReactNode, params: {id: string}}) => {
  return (
    <>
        <ProjectHeader />
        <section className="flex-auto flex">
            {children}
        </section>
    </>
  
  )
}

export default Layout

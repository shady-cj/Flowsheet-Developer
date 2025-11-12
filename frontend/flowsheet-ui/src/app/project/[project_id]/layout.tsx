


const Layout = ({children}: {children: React.ReactNode}) => {
  return (
    <div className="select-none flex flex-col h-screen w-full">

        <section className="grow-0 shrink-0 basis-auto h-[100vh] flex">
            {children}
        </section>
    </div>
  

  
  )
}

export default Layout



export default function Layout({children}: {children: React.ReactNode}) {
        
    return <section className="px-6 py-8 h-[90vh] overflow-y-auto" id="project-list__main">

            {children}

    </section>
}
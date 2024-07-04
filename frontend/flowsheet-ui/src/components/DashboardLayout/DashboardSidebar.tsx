import Link from "next/link"

const DashboardSidebar = () => {
  return (
    <div className="w-[22%] bg-default">
        <section className="w-full flex flex-col items-center mt-4 gap-4">
            <Link href="/projects" className="mt-8 font-bold">Projects</Link>
        </section>
      
    </div>
  )
}

export default DashboardSidebar

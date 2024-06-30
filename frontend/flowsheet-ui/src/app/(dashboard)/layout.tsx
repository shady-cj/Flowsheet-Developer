import DashboardHeader from "@/components/layout/DashboardHeader"
import DashboardSidebar from "@/components/layout/DashboardSidebar"


export default function DashboardLayout ({children}: {children: React.ReactNode}) {
    return (
        <>
            <DashboardHeader />
            <section className="flex-auto flex">
                <DashboardSidebar />
                {children}
            </section>     
        </>
    )
}
import DashboardHeader from "@/components/DashboardLayout/DashboardHeader"
import DashboardSidebar from "@/components/DashboardLayout/DashboardSidebar"


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
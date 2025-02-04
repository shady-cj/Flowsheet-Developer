import { UserProvider } from "@/components/context/UserProvider"
import DashboardHeader from "@/components/DashboardLayout/DashboardHeader"
import DashboardSidebar from "@/components/DashboardLayout/DashboardSidebar"


export default function DashboardLayout ({children}: {children: React.ReactNode}) {
    return (
        <UserProvider>   
            <DashboardHeader />
            <section className="flex-auto flex">
                <DashboardSidebar/>
                <div className="flex-auto bg-primary-2">
                    {children}
                </div>
            </section>     
        </UserProvider>
    )
}
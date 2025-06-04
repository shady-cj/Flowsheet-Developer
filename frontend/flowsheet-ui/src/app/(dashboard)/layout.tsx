import { UserProvider } from "@/components/context/UserProvider"
import DashboardHeader from "@/components/DashboardLayout/DashboardHeader"
import DashboardSidebar from "@/components/DashboardLayout/DashboardSidebar"
import Loader from "@/components/utils/loader"
import { Suspense } from "react"


export default function DashboardLayout ({children}: {children: React.ReactNode}) {
    return (
        <UserProvider>   
            <DashboardHeader />
            <section className="flex-auto flex">
                <Suspense fallback={<Loader color="black" />}>
                    <DashboardSidebar/>
                </Suspense>
                <div className="flex-auto bg-primary-2">
                    {children}
                </div>
            </section>     
        </UserProvider>
    )
}
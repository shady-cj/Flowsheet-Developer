import DashboardMain from "@/components/DashboardLayout/DashboardMain"

const Dashboard = async ({searchParams}:{searchParams: Promise<{f: string}>}) => {
  // const routeSearchParams = await searchParams
  // console.log("dashboard", routeSearchParams)
  return (
      <DashboardMain />
  )
}

export default Dashboard

import DashboardMain from "@/components/DashboardLayout/DashboardMain"

const Dashboard = ({searchParams}:{searchParams: {f: string}}) => {
  console.log("dashboard", searchParams)
  return (
      <DashboardMain searchParams={searchParams}/>
  )
}

export default Dashboard

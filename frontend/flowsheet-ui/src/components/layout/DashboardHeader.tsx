import Link from "next/link"
const DashboardHeader = () => {
  return (
    <header className="w-full shadow-md sticky bg-primary top-0 drop-shadow-lg backdrop-blur z-10">
        <div className="flex p-4">
            <Link href={"/dashboard"} className="font-bold font-size-default">
                Flowsheet
            </Link>
            <nav className="flex pl-4 gap-x-4 ml-auto">
                <Link href={"/profile"} className="font-bold font-size-default">Profile</Link>
                <Link href={"/logout"} className="font-bold font-size-default">Log out</Link>
            </nav>
        </div>
        
    </header>
  )
}

export default DashboardHeader

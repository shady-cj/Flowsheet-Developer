import Link from "next/link"
const HomeHeader = () => {
  return (
    <header className="w-full shadow-md sticky bg-primary top-0 drop-shadow-lg backdrop-blur">
        <div className="flex p-4">
            <Link href={"/"} className="font-bold font-size-default">
                Flowsheet
            </Link>
            <nav className="flex pl-4 gap-x-4 ml-auto">
                <Link href={"/login"} className="font-bold font-size-default">Login</Link>
                <Link href={"/register"} className="font-bold font-size-default">Sign Up</Link>
            </nav>
        </div>
        
    </header>
  )
}

export default HomeHeader

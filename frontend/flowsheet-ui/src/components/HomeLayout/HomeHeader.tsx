import Link from "next/link"
import logo from "@/assets/logo.png"
import Image from "next/image"
const HomeHeader = () => {
  return (
    <header className=" w-full shadow-sm sticky bg-[#FFFFFF] border-b-[#E9ECF0] border-b-[0.5px] top-0 drop-shadow-sm z-10 flex-initial">
        <div className="flex py-5 px-24 justify-between items-center">
            <Link href={"/"} className="font-bold font-size-default">
                <Image src={logo} alt="logo" width={88} height={29} />
            </Link>
            <nav className="flex items-center gap-x-10">
                <Link href={"/"} className="font-normal text-base text-gray-3">Documentation</Link>
                <Link href={"/"} className="font-normal text-base text-gray-3">Features</Link>
                <div className="flex gap-4">

                  <Link href={"/login"} className="px-5 py-2 rounded-lg border border-[#C7CFD6] font-medium text-base text-blue-variant">Login</Link>
                  <Link href={"/register"} className="py-2 px-4 bg-[#17181A] rounded-lg font-medium text-base text-[#F5F7FA]">Sign Up</Link>
                </div>

            </nav>
        </div>
    </header>
  )
}

export default HomeHeader

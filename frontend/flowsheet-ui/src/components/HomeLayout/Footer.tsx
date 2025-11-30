
import Link from "next/link"
const Footer = () => {
  return (
    <footer className="mt-32 xl:mt-40 py-[6rem] xl:py-[7.5rem] bg-[#F4F5F7]">
        <div className="flex flex-col items-center gap-y-14 ">
            <div className="flex flex-col gap-y-5">

                <h1 className="font-semibold text-5xl text-[3.3rem] xl:text-7xl hero-text text-center">
                    Visualize & Optimize<br/> your process now!
                </h1>
                <p className="text-normal xl:text-lg text-[#505F79] font-normal tracking-normal xl:tracking-wide text-center">Increase efficiency, reduce cost and optimize mineral<br /> processing operation with our flowsheet modelling software</p>
            </div>
            <div className="flex gap-4">
                <Link href="/register" className="py-3.5 px-5 bg-[#0052CC] rounded-lg text-white w-fit"> Create Account </Link>
                <Link href="/login" className="py-3.5 px-5 bg-[#17181A] rounded-lg text-white w-fit"> Login Account</Link>
            </div>

        </div>
      
    </footer>
  )
}

export default Footer

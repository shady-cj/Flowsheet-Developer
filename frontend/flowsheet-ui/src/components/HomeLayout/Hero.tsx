import Image from "next/image";
import Link from "next/link";
import flowsheetImg from "@/assets/flowsheet-demo.png"
const Hero = () => {
  return (
    <div className="flex-auto">
        <main className="w-full mx-auto bg-[#F5F7FA] pl-24 pt-16 landing-page-main flex">
          <div className="flex w-full gap-9 max-w-[1500px] h-[580px] lg:h-[560px] xl:h-[650px] 2xl:mx-auto">
            <div className="flex basis-[40%] flex-col justify-between gap-12 border border-[#C7CFD6] rounded-xl py-12 px-8 bg-[#E9ECF0] shrink-0">
              <div className="flex flex-col gap-6">
                <h1 className="font-semibold text-5xl lg:text-[3.5rem] xl:text-7xl hero-text">Visualize your mineral processing workflow</h1>
                <p className="font-inter text-normal xl:text-lg text-[#505F79] font-normal tracking-normal xl:tracking-wide">
                    Increase efficiency, reduce cost and optimize mineral processing operation with our flowsheet modelling software
                </p>
              </div>
              <Link href="/register" className="py-3.5 px-5 bg-[#0052CC] rounded-lg text-white w-fit"> Create Account </Link>
            </div>
            <div className="basis-[60%] border border-[#2570BB] bg-[#006644] rounded-2xl overflow-hidden ">
              <div className="w-[1134px] h-[736.5px]">
                <Image src={flowsheetImg} className="h-auto ml-[44px] mt-[50px] rounded-2xl" alt="flowsheet" width={1134} height={736.5} quality={100} layout="fixed" priority/>
              </div>
            </div>
          </div>
          
        </main>
      </div>
  )
}

export default Hero

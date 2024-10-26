import Image from "next/image";
import Link from "next/link";
import flowsheetImg from "@/assets/flowsheet-demo.png"
const Hero = () => {
  return (
    <div className="flex-auto">
        <main className="w-full mx-auto bg-[#F5F7FA] landing-page-main flex">
          <div className="flex gap-9 w-full max-w-[1500px] ml-24 mt-16 h-[480px] lg:h-[460px] xl:h-[500px] 2xl:mx-auto 2xl:h-[550px]">
            <div className="flex basis-[40%] flex-col justify-between gap-14 border border-[#C7CFD6] rounded-xl py-12 px-8 bg-[#E9ECF0] shrink-0">
              <div className="flex flex-col gap-6">
                <h1 className="font-semibold text-4xl lg:text-[2.8rem] xl:text-6xl hero-text">Visualize your mineral processing workflow</h1>
                <p className="font-inter text-normal 2xl:text-xl text-[#505F79] font-normal tracking-wider">
                    Increase efficiency, reduce cost and optimize mineral processing operation with our flowsheet modelling software
                </p>
              </div>
              <Link href="/register" className="py-3.5 px-5 bg-[#0052CC] rounded-lg text-white w-fit"> Create Account </Link>
            </div>
            <div className="basis-[60%] border border-[#2570BB] bg-[#006644] rounded-2xl overflow-hidden">
              <Image src={flowsheetImg} className="h-auto ml-[44px] mt-[50px] rounded-2xl" alt="flowsheet" width={1134} height={736.5} quality={100}/>
            </div>
          </div>
          
        </main>
      </div>
  )
}

export default Hero

import Image from "next/image";
import Link from "next/link";
import flowsheetImg from "@/assets/flowsheet-demo.png"
const Hero = () => {
  return (
    <div className="flex-auto">
        <main className="w-full mx-auto bg-[#F5F7FA] pl-20 xl:pl-24 pt-16 pb-5 landing-page-main flex">
          <div className="flex w-full gap-8 max-w-[2000px] h-[540px] xl:h-[650px] 2xl:mx-auto">
            <div className="flex basis-[40%] flex-col justify-between gap-y-8 border border-[#C7CFD6] rounded-xl py-12 px-8 bg-[#E9ECF0] shrink-0">
              <div className="flex flex-col gap-6">
                <h1 className="font-semibold text-[3.3rem] xl:text-7xl hero-text">Visualize your mineral processing workflow</h1>
                <p className="font-inter text-base xl:text-lg text-[#505F79] font-normal tracking-normal xl:tracking-wide max-w-[80%] 2xl:max-w-[60%] 2xl:py-4">
                    Increase efficiency, reduce cost and optimize mineral processing operation with our flowsheet modelling software
                </p>
              </div>
              <Link href="/register" className="py-3 px-5 bg-normalBlueVariant hover:bg-blueVariant transition-2 rounded-lg text-white w-fit"> Create Account </Link>
            </div>
            <div className="basis-[60%] border border-[#2570BB] bg-tertiary rounded-2xl overflow-hidden ">
              <div className="w-[1134px] h-[736.5px]">
                <Image src={flowsheetImg} className="h-auto ml-[30px] mt-[30px] xl:ml-[35px] xl:mt-[35px] rounded-2xl" alt="flowsheet" width={1134} height={736.5} quality={100} layout="fixed" priority/>
              </div>
            </div>
          </div>
          
        </main>
      </div>
  )
}

export default Hero

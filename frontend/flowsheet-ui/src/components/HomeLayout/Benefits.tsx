import Link from "next/link"

import flowsheetImage from "@/assets/feature-flowsheet.png"
import Image from "next/image"
import component1 from "@/assets/Component-1.png"
import component2 from "@/assets/Component-2.png"
import screenerProperty from "@/assets/screener-property.png"
import crusherProperty from "@/assets/crusher-property.png"
import featureFlowsheet from "@/assets/feature-canvas.png"

const Benefits = () => {
  return (
    <section className="pt-44 px-24">
      <h1 className="text-5xl lg:text-[3.5rem] xl:text-7xl hero-text font-semibold text-center">Features &<br/> Benefits</h1>
      <div className="mt-32 w-full h-[35.625rem] bg-[#16191C] rounded-xl">
        <div className="pt-12 max-w-[1500px] ml-24 2xl:mx-auto flex h-full gap-12">

          <div className="pt-32 basis-[40%]">
            <div className="flex flex-col gap-y-5">

              <h2 className="text-[2.5rem] leading-[50px] xl:text-[3rem] font-semibold text-[#C7CFD6]">
                Intuitive Flowsheet Creation
              </h2>
              <p className="text-base xl:text-lg font-normal text-white">
                Build and modify flowsheets effortlessly with a user-friendly drag-and-drop interface
              </p>
              <Link href="/" className="text-[1.0625rem] text-white font-semibold">
               Learn More
              </Link>
            </div>

          </div>
          <div className="basis-[60%] overflow-hidden h-full">
            <div className="w-[1134px] h-[736.5px]">
              <Image src={flowsheetImage} width={1134} height={736.5} className="rounded-2xl" alt="flowsheet sample" quality={100} layout="fixed" priority/>
            </div>
          </div>
        </div>

      </div>
      <div className="h-[35.625rem] rounded-xl bg-[#EDF1F5] w-full overflow-hidden">
        <div className="relative max-w-[1500px] 2xl:mx-auto">
          <Image src={component1} width={251} height={560} alt="component image 1" className="h-auto absolute left-[61px] -top-[10px]" quality={100} priority/>
          <Image src={component2} width={300} height={560} alt="component image 1" className="h-auto absolute left-[240px] top-[80px]" quality={100} priority/>
          <div className="absolute right-32 top-[8.5rem]">
            <div className="flex flex-col gap-5 max-w-[300px] xl:max-w-[520px]">
              <h2 className="text-[2.5rem] leading-[50px] xl:text-[3rem] font-semibold text-black">
                Extensive Library of Unit Operation Models
              </h2>
              <p className="text-base xl:text-lg font-normal text-[#242526]">
                Access a comprehensive library of unit operation models encompassing various crushing, grinding, screening, and separation techniques.
              </p>
              <Link href="/" className="text-[1.0625rem] text-[#0052CC] font-semibold">
                Learn More
              </Link>
            </div>

          </div>
        </div>

      </div>
      <div className="h-[35.625rem] rounded-xl border border-[#CCCCCC] w-full overflow-hidden">
        <div className="relative max-w-[1500px] 2xl:mx-auto">
          <div className="absolute left-24 top-[12rem]">
            <div className="flex flex-col gap-5 max-w-[350px] xl:max-w-[520px]">
                <h2 className="text-[2.5rem] leading-[50px] xl:text-[3rem] font-semibold text-black">
                  Material Property Customization
                </h2>
                <p className="text-base xl:text-lg font-normal text-[#242526]">
                  Achieve reliable simulation results by incorporating the specific material properties of your ore type into the software.
                </p>
                <Link href="/" className="text-[1.0625rem] text-[#0052CC] font-semibold">
                  Learn More
                </Link>
              </div>
          </div>
          <Image src={crusherProperty} width={336} height={468} alt="crusher property" quality={100} className="absolute h-auto w-[300px] xl:w-[336px] -top-[25px] right-[78px]"/>
          <Image src={screenerProperty} width={430} height={468} alt="screener property" quality={100} className="absolute h-auto w-[370px] xl:w-[430px] right-[220px] top-[160px] xl:right-[290px] xl:top-[100px] "/>

        </div>
      </div>
      <div className="h-[35.625rem] rounded-xl bg-[#006644] w-full overflow-hidden">
        <div className="max-w-[1500px] 2xl:mx-auto flex gap-24 pt-[3.812rem]">
          <div className="basis-1/2  grow-0 shrink-0 relative">
            <div className="w-[1134px] h-[736.5px] absolute right-0 top-0">
              <Image width={1134} height={736.5} src={featureFlowsheet} alt="feature flowsheet image" quality={100} layout="fixed" priority className="rounded-2xl"/>
            </div>
          </div>
          <div className="basis-1/2 grow-0 shrink-0 flex h-[30rem] items-center">
            <div className="flex flex-col gap-5 max-w-[350px] xl:max-w-[520px]">
                <h2 className="text-[2.5rem] leading-[50px] xl:text-[3rem] font-semibold text-[#DFE1E6]">
                  Simulate and optimize process
                </h2>
                <p className="text-base xl:text-lg font-normal text-white">
                  Run simulations based on your defined flowsheet and material properties to gain valuable insights into process performance.
                </p>
                <Link href="/" className="text-[1.0625rem] text-white font-semibold">
                  Learn More
                </Link>
              </div>
          </div>
  
        </div>
      </div>
    </section>
  ) 
}

export default Benefits

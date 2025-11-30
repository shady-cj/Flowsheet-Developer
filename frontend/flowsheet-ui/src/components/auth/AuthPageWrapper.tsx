"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AuthPageWrapper = ({children}: {children: React.ReactNode}) => {
  const pathname = usePathname();
  return (

    <div className='bg-[#F7F9FA] flex-auto flex 2xl:justify-center 2xl:items-center'>
      <div className='flex h-[750px] w-full xl:h-[900px] max-w-[1700px]'>

        {children}
        <div className='basis-[50%] p-6 '>
          <div className='w-full relative h-full overflow-hidden rounded-xl'>
              <div className='w-full h-full relative'>
                  <div className='w-[1200px] h-full bg-auth-image absolute right-0 '>
                  </div>
              </div>
              {/* <Image src={AuthImage} alt="auth image" className='rounded-xl' fill/> */}
              <div className='absolute left-[48px] bottom-[58px] flex flex-col gap-10'>
                  <h1 className='text-white text-[3.3rem] font-semibold xl:text-[4rem] leading-[4.5rem]'>
                  Visualize your <br /> mineral processing <br /> workflow
                  </h1>
                  {
                    pathname === "/login" ? (
                      <Link href="/register" className="py-4 px-6 bg-[#16191C] rounded-lg text-[#F5F7FA] w-fit"> Create Account </Link>
                    ) : (
                      <Link href="/login" className="py-4 px-6 bg-[#16191C] rounded-lg text-[#F5F7FA] w-fit"> Login Account </Link>
                    )
                  }

              </div>
          </div>
      </div>
      </div>

    </div>
  )
}

export default AuthPageWrapper

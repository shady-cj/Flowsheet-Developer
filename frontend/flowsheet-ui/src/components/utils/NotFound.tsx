import HomeHeader from '@/components/HomeLayout/HomeHeader'
import React from 'react'
import { cookies } from 'next/headers'
import DashboardHeader from '@/components/DashboardLayout/DashboardHeader'

const NotFoundPage = async ({children}: {children: React.ReactNode}) => {
  const accessToken = (await cookies()).get("access")?.value
  return (
    <>
        {
          accessToken ? <DashboardHeader/> : <HomeHeader />
        }
        <div className='h-screen -mt-14 flex justify-center items-center'>
            {children}
        </div>
    </>
  )
}

export default NotFoundPage
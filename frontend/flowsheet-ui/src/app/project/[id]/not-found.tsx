import HomeHeader from '@/components/HomeLayout/HomeHeader'
import React from 'react'
import { cookies } from 'next/headers'
import DashboardHeader from '@/components/DashboardLayout/DashboardHeader'

const NotFoundPage = () => {
  const accessToken = cookies().get("access")?.value
  return (
    <>
        {
          accessToken ? <DashboardHeader/> : <HomeHeader />
        }
        <div className='h-screen -mt-14 flex justify-center items-center'>
            Project does not exist
        </div>
    </>
  )
}

export default NotFoundPage

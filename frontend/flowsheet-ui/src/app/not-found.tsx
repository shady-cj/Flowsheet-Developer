import HomeHeader from '@/components/layout/HomeHeader'
import React from 'react'

const NotFoundPage = () => {
  return (
    <>
        <HomeHeader />
        <div className='h-screen -mt-14 flex justify-center items-center'>
            UH-OH Wrong Page
        </div>
    </>
  )
}

export default NotFoundPage

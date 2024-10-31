import HomeHeader from '@/components/HomeLayout/HomeHeader'
import React from 'react'

const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <>
        {/* <HomeHeader /> */}
        {children}
    </>
  )
}

export default AuthLayout

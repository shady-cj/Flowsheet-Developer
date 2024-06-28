import HomeHeader from '@/components/layout/HomeHeader'
import React from 'react'

const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <>
        <HomeHeader />
        {children}
    </>
  )
}

export default AuthLayout

import React from 'react'
import Loader from '@/components/utils/loader';
import { Suspense } from 'react';



const AuthLayout = ({children}: {children: React.ReactNode}) => {
  return (
    <>
        {/* <HomeHeader /> */}
        <Suspense fallback={<Loader color='black'/>}>

          {children}
        </Suspense>
    </>
  )
}

export default AuthLayout

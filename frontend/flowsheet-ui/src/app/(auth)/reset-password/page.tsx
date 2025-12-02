
import AuthPageWrapper from '@/components/auth/AuthPageWrapper'
import Logo from '@/components/Logo'
import React, { useActionState } from 'react'
import logoIcon from "@/assets/logo-icon-2.svg"
import Image from 'next/image'
import Button from '@/components/utils/Button'
import { passwordReset } from '@/lib/actions/auth'
import AuthStatusBox from '@/components/utils/StatusBox'
import Link from 'next/link'
import PasswordChange from '@/components/auth/PasswordChange'

const apiURL = process.env.API_URL as string

const ResetPassword = async ({searchParams}: {searchParams: Promise<{token: string}>}) => {
    const token = (await searchParams).token;


    if (!token)
        return <div className='flex items-center justify-center h-screen'>
                <h2 className='text-red-500 font-bold'>Invalid or missing token</h2>
            </div>

    const response = await fetch(`${apiURL}/auth/password-reset-verification/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
    });
    const data = await response.json();

    if (response.status !== 200) {
        return <div className='flex items-center justify-center h-screen'>
                <h2 className='text-red-500 font-bold'>{data.error || 'Invalid or expired token'}</h2>
            </div>
    }

    if (response.status === 200 && data.email) {
        return (
        <AuthPageWrapper>
            <section className='flex flex-col gap-10 items-center justify-center basis-[50%]'>
            
            <div className='flex flex-col gap-10 -mt-[10rem]'>

                <div className='flex flex-col gap-4'>
                    <Logo logoIcon={logoIcon}/>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-[#16191C] text-[2rem] xl:text-[2.5rem] font-semibold leading-[3.1rem]'>Change Your Password</h1>
                    </div>
                </div>
                <PasswordChange token={token} email={data.email}/>
            </div>
            </section>
        </AuthPageWrapper>
    )
    }


    
}

export default ResetPassword

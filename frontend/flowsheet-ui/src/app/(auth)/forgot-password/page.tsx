"use client"
import AuthPageWrapper from '@/components/auth/AuthPageWrapper'
import Logo from '@/components/Logo'
import React, { useActionState } from 'react'
import logoIcon from "@/assets/logo-icon-2.svg"
import Image from 'next/image'
import Button from '@/components/utils/Button'
import { passwordReset } from '@/lib/actions/auth'
import AuthStatusBox from '@/components/utils/StatusBox'
import Link from 'next/link'

const ForgotPassword = () => {
    const [state, formAction] = useActionState(passwordReset, null)
    return (
        <AuthPageWrapper>
            <section className='flex flex-col gap-10 items-center justify-center basis-[50%]'>
            
            <div className='flex flex-col gap-8 xl:gap-10 -mt-[10rem]'>

                <div className='flex flex-col gap-4'>
                    <Logo logoIcon={logoIcon}/>
                    <div className='flex flex-col gap-2'>
                        <h1 className='text-[#16191C] text-[2rem] xl:text-[2.5rem] font-semibold leading-[3.1rem]'>Forgot Password</h1>
                    </div>
                </div>
                <form action={formAction} className='flex flex-col gap-y-5'>
                    <h2 className='text-[#666666] text-base xl:text-lg font-normal'>Please enter your email address to reset your password.</h2>

                    <input type="email" name="email" placeholder="email@example.com" className='py-3 px-4 rounded-lg border border-[#C7CFD6] text-sm text-[#808080] font-normal min-w-[20rem] bg-transparent' required />
                    
                    {
                        state && <AuthStatusBox state={state}/>
                    }
                    <div className='w-full flex justify-center items-center'>
                
                        <Button title="Request Password Reset"/>
                    </div>
                    <div>
                        <Link href="/login" className='text-[#2570BB] font-medium text-sm xl:text-base'>Go back to Login</Link>
                    </div>
                </form>
            </div>
            </section>
        </AuthPageWrapper>
    )
}

export default ForgotPassword

"use client";
import PasswordInput from '@/components/auth/PasswordInput'
import { login } from '@/lib/actions/auth'
import Button from '@/components/utils/Button';
// import { useFormState } from 'react-dom';
import AuthStatusBox from '@/components/utils/StatusBox';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import AuthPageWrapper from '@/components/auth/AuthPageWrapper';
import Image from 'next/image';
import logoIcon from "@/assets/logo-icon-2.svg"
import googleIcon from "@/assets/Google.svg"
import { signIn } from 'next-auth/react';
import { useActionState, useEffect } from 'react';

const LoginPage = () => {
  const [state, formAction] = useActionState(login, null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextURL = searchParams.get("nextURL")
  const error = searchParams.get("error")
  if (state?.success) {
    setTimeout(()=> {

        if (nextURL)
          return router.replace(nextURL)
        else
          return router.replace('/dashboard')
    }, 1000)
  }
  useEffect(()=> {
    if (error) {
      alert(error)
    }
  }, [error])
  return (
      <AuthPageWrapper>

        <section className='flex flex-col gap-10 items-center justify-center basis-[50%]'>
          <div className='flex flex-col gap-10'>

          <div className='flex flex-col gap-4'>
            <Logo logoIcon={logoIcon}/>
            <div className='flex flex-col gap-2'>
              <h2 className='text-[#16191C] text-[2.5rem] font-semibold leading-[3.1rem]'>Login account</h2>
              <p className='text-[#666666] text-base font-normal'>Welcome back, login to continue</p>
            </div>
            <div className='mt-4 flex justify-center items-center border border-[#C7CFD6] rounded-lg cursor-pointer' onClick={() => signIn("google")}>
              <div className='flex gap-4 py-2 items-center'>
                <Image src={googleIcon} height={24} width={24} alt="google icon" quality={100}/>
                <p className='text-sm font-medium text-[#16191C]'>
                  Continue with Google
                </p>
              </div>
            </div>
          </div>
          <div className='flex gap-4 items-center'>
            <div className='h-[1px] bg-[#C7CFD6] flex-1'></div>
            <span className='text-[#16191C] text-sm font-normal'>OR</span>
            <div className='h-[1px] bg-[#C7CFD6] flex-1'></div>
          </div>
          <form action={formAction} className='flex flex-col gap-y-5'>
              <div className='flex flex-col gap-2'>
                  <label htmlFor="email" className='text-sm font-medium'>Email</label>
                  <input type="email" id="email" name='email' placeholder='Enter your email address' className='py-3 px-4 rounded-lg border border-[#C7CFD6] text-sm text-[#808080] font-normal min-w-[20rem] bg-transparent' required/>
              </div>
              <div className='flex flex-col gap-2'>
                  <label htmlFor="password" className='text-sm font-medium'>Password</label>
                  <PasswordInput name="password" id="password" placeholder='Input your password'/>
              </div>
              {
                  state && <AuthStatusBox state={state}/>
              }
              <div className='w-full flex justify-center items-center'>
              
                <Button title="Login Account"/>
              </div>
              <div className='text-[#16191C] font-normal text-base '>
                Don&apos;t have an account? <Link href="/register" className='text-[#2570BB] font-medium text-base'>Sign-up </Link>
              </div>
              <div>
                <Link href="/forgot-password" className='text-[#2570BB] font-medium text-base'>Forgot password</Link>
              </div>
          </form>
          </div>
        

        </section>
      </AuthPageWrapper>

  )
}

export default LoginPage

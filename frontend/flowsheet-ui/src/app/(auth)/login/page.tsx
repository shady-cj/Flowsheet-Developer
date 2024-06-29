"use client";
import PasswordInput from '@/components/auth/PasswordInput'
import { login } from '@/lib/actions/auth'
import Button from '@/components/auth/AuthButton';
import { useFormState } from 'react-dom';
import AuthStatusBox from '@/components/auth/AuthStatusBox';
import { useRouter, useSearchParams } from 'next/navigation';


const LoginPage = () => {
  const [state, formAction] = useFormState(login, null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextURL = searchParams.get("nextURL")
  console.log(nextURL)
  if (state?.success) {
    setTimeout(()=> {
        if (nextURL) router.replace(nextURL)
        router.replace('/dashboard')
    }, 1000)
  }
  return (
    <section className='h-screen bg-[#ffdda680] flex items-center justify-center'>
        <form action={formAction} className='flex flex-col gap-y-4'>
            <h2 className='font-bold text-2xl mb-4 text-center'>Sign in</h2>
            <div className='flex flex-col gap-2'>
                <label htmlFor="email" className='font-bold'>Email</label>
                <input type="email" id="email" name='email' className='p-2 rounded bg-gray-100 text-sm min-w-[20rem]' required/>
            </div>
            <div className='flex flex-col gap-2'>
                <label htmlFor="password" className='font-bold'>Password</label>
                <PasswordInput name="password" id="password"/>
            </div>
            {
                state && <AuthStatusBox state={state}/>
            }
            
            <Button title="Login"/>
        </form>

    </section>
  )
}

export default LoginPage

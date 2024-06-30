"use client";
import PasswordInput from '@/components/auth/PasswordInput'
import Button from '@/components/auth/AuthButton';
import { useFormState } from 'react-dom';
import { register } from '@/lib/actions/auth';
import AuthStatusBox from '@/components/auth/AuthStatusBox';
import { useRouter } from 'next/navigation';

const Register = () => {
    const router = useRouter()
    const [state, formAction] = useFormState(register, null)
    if (state?.success) {
        setTimeout(()=>{
            router.push('/login')
        }, 2000)
    }
    return (
        <section className='bg-[#ffdda680] flex items-center justify-center flex-auto'>
            <form action={formAction} className='flex flex-col gap-y-4'>
                <h2 className='font-bold text-2xl mb-4 text-center'>Register</h2>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="email" className='font-bold'>Email</label>
                    <input type="email" id="email" name='email' className='p-2 rounded bg-gray-100 text-sm min-w-[20rem]' required/>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="password" className='font-bold'>Password</label>
                    <PasswordInput name="password" id="password"/>
                </div>
                <div className='flex flex-col gap-2'>
                    <label htmlFor="confirmpassword" className='font-bold'>Confirm Password</label>
                    <PasswordInput name="confirm_password" id="confirmpassword"/>
                </div>
                {
                    state && <AuthStatusBox state={state}/>
                }
                
                <Button title="Register"/>
            </form>

        </section>
    )
}

export default Register

import PasswordInput from '@/components/PasswordInput'

const page = () => {
  return (
    <section className='h-screen bg-[#ffdda680] flex items-center justify-center'>
        <form action="" className='flex flex-col gap-y-4'>
            <h2 className='font-bold text-2xl mb-4 text-center'>Register</h2>
            <div className='flex flex-col gap-2'>
                <label htmlFor="email" className='font-bold'>Email</label>
                <input type="email" id="email" name='email' className='p-2 rounded bg-gray-100 text-sm'/>
            </div>
            <div className='flex flex-col gap-2'>
                <label htmlFor="password" className='font-bold'>Password</label>
                <PasswordInput name="password" id="password"/>
            </div>
            <div className='flex flex-col gap-2'>
                <label htmlFor="confirmpassword" className='font-bold'>Confirm Password</label>
                <PasswordInput name="confirm_password" id="confirmpassword"/>
            </div>
            <button className='rounded-md px-4 py-2 w-fit bg-[#282c33] text-white hover:bg-white hover:text-[#282c33] font-bold transition-colors mx-auto mt-2'>
                Register
            </button>
        </form>

    </section>
  )
}

export default page

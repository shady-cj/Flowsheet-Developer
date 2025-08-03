"use client"
import React, { useState } from 'react'
import Button from '../utils/Button'
import Link from 'next/link'
import AuthStatusBox from '../utils/StatusBox'
import { passwordChange } from '@/lib/actions/auth'
import { useRouter } from 'next/navigation'
import PasswordInput from './PasswordInput'

const PasswordChange = ({token, email}:{token:string, email: string}) => {
    const [formState, setFormState] = useState({
        new_password: '',
        confirm_password: ''
    })
    const [state, setState] = useState<{error: string} | {detail: string} | {success: string} | null>(null)
    const router = useRouter()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({ ...prev, [name]: value }))
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { new_password, confirm_password } = formState
        if (new_password.length === 0 || confirm_password.length === 0) {
            setState({detail: "All fields are required"})
            return
        }
        if (new_password !== confirm_password) {
            setState({detail: "Passwords do not match"})
            return
        }

        const response = await passwordChange({...formState, token, email })
        setState(response)
        if (response && response.success) {
            
            setTimeout(() => {
                setState(null)
                setFormState({ new_password: '', confirm_password: '' })
                router.replace('/login') // Redirect to login page after successful password change

            },3000)
            // Handle successful password change (e.g., redirect or show success message)
        }
    }


    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-y-5'>
            <div className='flex flex-col gap-2'>
                <label htmlFor="new_password" className='text-sm font-medium'>New Password</label>
                <PasswordInput name="new_password" id="new_password" onChange={handleChange} placeholder='Input your new password'/>
            </div>
            <div className='flex flex-col gap-2 '>
                <label htmlFor="confirm_password" className='text-sm font-medium'>Confirm Password</label>
                <PasswordInput name="confirm_password" id="confirm_password" onChange={handleChange} placeholder='Confirm your new password'/>
            </div>
            <small className='text-[#666666] text-sm font-normal'><em>Password must be atleast 8 characters long</em></small>
            {
                        state && <AuthStatusBox state={state}/>
            }
            <div className='w-full flex justify-center items-center'>
                <Button title="Change Password"/>
            </div>
        </form>
  )
}

export default PasswordChange

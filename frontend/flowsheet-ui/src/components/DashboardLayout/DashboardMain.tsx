import React, { Suspense } from 'react'
import Link from "next/link"
import folder from "@/assets/folder.svg"
import Image from 'next/image'
import DashboardPageRenderer from './DashboardPageRenderer'
import CreateFlowsheetCard from './CreateFlowsheetCard'
import Loader from '../utils/loader'

const DashboardMain = () => {
//   console.log('search params', searchParams)

// const activeSection = search
return (
    <section className='overflow-y-scroll h-[90vh]'>
        <section className=''>
            <section className='pt-12 px-5 h-[14.5rem] border-b border-solid border-[#E6E6E6]'>

                <h2 className='mb-4 font-medium text-xl text-text-black-2'>Quick Actions</h2>
                <div className='flex gap-x-4'>
                    <CreateFlowsheetCard />
                    <Link href="/projects/create" className='inline-flex bg-[#E6FAF3] w-[14.5rem] p-4 flex-col gap-y-3 rounded-lg'>
                        
                        <Image src={folder} alt="" width={24} height={24} />
                        <span className='text-[#006644] text-normal'>New Project</span>
                    </Link>
                </div>
            </section>
            <section className='py-12 px-5'>
                <Suspense fallback={<Loader fullScreen={false} offsetHeightClass='h-[200px]' color='black' />}>
                    <DashboardPageRenderer/>
                </Suspense>
            </section>


        </section>
      
    </section>
  )
}

export default DashboardMain


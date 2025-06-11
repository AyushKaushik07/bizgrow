"use client"
import { ModeToggle } from '@/components/modetoggle'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import React from 'react'
import { Settings } from 'lucide-react'
import ReportComponent from '@/components/reportComponent'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { DrawerTitle } from '@/components/ui/drawer'

type Props = {}

const HomeComponent = (props: Props) => {
  return (
    <div className='grid h-screen -w-full'>
      <div className='flex flex-col'>
        <header className='sticky top-0 z-10 h-[57px] bg-background flex items-center gap-1 border-b px-4 '>
          <h1 className='text-xl font-semibold text-[#D90013]'>BizzGrow</h1>
          <div className='w-full flex flex-row justify-end gap-2'>
            <ModeToggle />
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant={'outline'} size={'icon'} className='md:hidden'><Settings /></Button>
              </DrawerTrigger>
              <DrawerContent className='h-[80vh]'>
                {/* Add hidden title for accessibility */}
                <VisuallyHidden>
                  <DrawerTitle>Document Upload Settings</DrawerTitle>
                </VisuallyHidden>
                <ReportComponent />
              </DrawerContent>              
            </Drawer>
          </div>
        </header>
      </div>
    </div>
  )
}

export default HomeComponent
"use client"
import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Book, Compass, LayoutDashboard, PencilRulerIcon, UserCircle2Icon, WalletCards } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AddNewCourse from './AddNewCourse'

const sidebaroption =[
  {
    title:'Dashboard',
    icon:LayoutDashboard,
    path: '/workspace'
  },
    {
    title:'My Learning',
    icon:Book,
    path: '/workspace/my-courses'
  },
    {
    title:'Explore Courses',
    icon: Compass,
    path: '/workspace/explore'
  },
    {
    title:'Ai Tools',
    icon:PencilRulerIcon,
    path: '/workspace/ai-tools'
  },
    {
    title:'Billing',
    icon:WalletCards,
    path: '/workspace/billing'
  },
    {
    title:'Profile',
    icon:UserCircle2Icon,
    path: '/workspace/profile'
  }
]

function AppSidebar() {
  const path = usePathname();
  return (
        <Sidebar>
        <SidebarHeader>
                    <Image className='p-1'
          src="/logo.png"
          alt="Learnify AI Logo"
          width={180} // adjust as needed
          height={180}
        //   className="rounded-xl object-cover" // gives round corners
        />
        </SidebarHeader>
      <SidebarContent>

          <SidebarGroup>
            <AddNewCourse>
            <Button>Create new Course</Button>
            </AddNewCourse>
          </SidebarGroup>
          
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebaroption.map((item,index)=>(
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild className='p-5'>
                        <Link href={item.path} 
                        className={`text-[17px]
                          ${path.includes(item.path)&&'text-primary bg-purple-100'}
                        `}>
                            <item.icon className='h-7 w-7'/>
                            <span>{item.title}</span>
                        </Link>                        
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}

export default AppSidebar
'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { serviceName } from '@/config/const'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { session } = useAuth()

  const handleLogout = async () => {
    // ログアウト処理をここに実装
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = session
    ? [
      { href: '/timeline', label: 'Timeline' },
      { href: `/profile`, label: 'Profile' },
    ]
    : [
      { href: '/login', label: 'Login' },
      { href: '/signup', label: 'Sign Up' },
    ]

  const NavItems = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {item.label}
        </Link>
      ))}
    </>
  )

  const HomeLink = ({ serviceName }: { serviceName: string }) => {
    return (
      <Link href="/" className="mx-5 flex items-center space-x-2">
        <span className="font-bold">{serviceName}</span>
      </Link>
    )
  }



  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="mx-5 container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <HomeLink serviceName={serviceName} />
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <NavItems />
          </nav>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              {/* <span className="sr-only">Toggle Menu</span> */}
              <HomeLink serviceName={serviceName} />
            </Button>
          </SheetTrigger>


          <SheetContent side="left" className="pr-0">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <span className="font-bold">{serviceName}</span>
            </Link>
            <nav className="my-4 flex flex-col space-y-4">
              <NavItems />
              <div className="flex justify-start">
                {session && (
                  <Button
                    variant="ghost"
                    className="inline-flex md:hidden"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                )}

              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 検索機能などを追加する場合はここに実装 */}
          </div>
          <nav className="flex items-center">
            {session && (
              <Button
                variant="ghost"
                className="hidden md:inline-flex"
                onClick={handleLogout}
              >
                Logout
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
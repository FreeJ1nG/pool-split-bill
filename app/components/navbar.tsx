import { useNavigate } from '@remix-run/react'
import { ChevronDown } from 'lucide-react'

import logoUrl from '~/assets/logo.png'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu.tsx'
import type { User } from '~/schemas/auth.ts'

export interface NavbarProps {
  userData?: User
}

export default function Navbar({ userData }: NavbarProps) {
  const navigate = useNavigate()

  return (
    <div className="fixed left-0 right-0 top-0 flex h-14 items-center justify-between bg-black px-5 text-white">
      <button onClick={() => navigate('/')}>
        <img src={logoUrl} alt="Logo" className="h-8 w-8" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger>
          {userData && (
            <div className="flex items-center text-sm">
              <div>
                Logged in as
                <b>{' ' + userData.name}</b>
              </div>
              <ChevronDown size={16} className="ml-1.5" />
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{userData?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Add avatar</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/sso/logout')}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

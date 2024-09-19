import { PopoverClose } from '@radix-ui/react-popover'
import { useSubmit } from '@remix-run/react'
import { Pencil } from 'lucide-react'
import { useCallback, useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '~/components/ui/avatar.tsx'
import { Button } from '~/components/ui/button.tsx'
import { DropdownMenuSeparator } from '~/components/ui/dropdown-menu.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover.tsx'
import { PROFILE_COLOR_CHOICES } from '~/constants/color.ts'
import { useToast } from '~/hooks/use-toast.ts'
import { cn, getAbbreviatedName } from '~/lib/utils.ts'
import type { User } from '~/schemas/auth.ts'

export interface ProfileColorPickerProps {
  userData: User
}

export default function ProfileColorPicker({
  userData,
}: ProfileColorPickerProps) {
  const submit = useSubmit()
  const { toast } = useToast()
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    userData.fallbackProfileColor,
  )

  const handleSave = useCallback(() => {
    if (!selectedColor) {
      toast({
        title: 'You must select a color before saving',
        variant: 'destructive',
      })
      return
    }
    const formData = new FormData()
    formData.append('color', selectedColor)
    submit(formData, { method: 'POST', action: '/api/profile/color' })
  }, [selectedColor, submit, toast])

  return (
    <>
      <DropdownMenuSeparator />
      <div className="flex w-full justify-center">
        <Popover>
          <PopoverTrigger>
            <div className="relative">
              <div className="absolute right-0 top-0 z-40">
                <Pencil size={14} />
              </div>
              <Avatar>
                <AvatarImage src={userData.profileSrc} />
                <AvatarFallback style={{ backgroundColor: selectedColor }}>
                  {getAbbreviatedName(userData.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent className="flex w-fit flex-col">
            <div className="grid grid-cols-4 gap-2">
              {PROFILE_COLOR_CHOICES.map(colorHex => (
                <button
                  key={colorHex}
                  onClick={() =>
                    setSelectedColor(prev =>
                      prev === colorHex ? undefined : colorHex,
                    )}
                  className={cn('h-5 w-5', {
                    'border-2 border-black': selectedColor === colorHex,
                  })}
                  style={{ backgroundColor: colorHex }}
                >
                </button>
              ))}
            </div>
            <PopoverClose asChild>
              <Button size="sm" className="mt-3" onClick={handleSave}>
                Save
              </Button>
            </PopoverClose>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}

import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Edit } from 'lucide-react'
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from 'react'

import { Checkbox } from '~/components/ui/checkbox.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command.tsx'
import { Input } from '~/components/ui/input.tsx'
import { Label } from '~/components/ui/label.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover.tsx'
import type { User } from '~/schemas/auth.ts'
import type { Participant } from '~/schemas/bill.ts'

export interface CreateBillParticipantsCommandProps {
  users: User[]
  participants: Participant[]
  setParticipants: Dispatch<SetStateAction<Participant[]>>
  startTime: Dayjs
  endTime: Dayjs
}

export default function CreateBillParticipantsCommand({
  users,
  participants,
  setParticipants,
  startTime,
  endTime,
}: CreateBillParticipantsCommandProps) {
  const handleParticipantUpdateFactory = useCallback(
    (
      user: User,
      newValueFactory:
        | ((event: ChangeEvent<HTMLInputElement>) => Partial<Participant>)
        | Partial<Participant>,
    ) =>
      (event?: ChangeEvent<HTMLInputElement>) => {
        setParticipants((prev) => {
          const toBeDeleted = prev.find(p => p.email === user.email)

          if (!toBeDeleted) return [...prev]

          const newValue =
            typeof newValueFactory === 'function' && event
              ? newValueFactory(event)
              : newValueFactory

          return [
            ...prev.filter(p => p.email !== user.email),
            {
              ...toBeDeleted,
              ...newValue,
            },
          ]
        })
      },

    [setParticipants],
  )

  return (
    <Command className="mt-4 rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Find other players here ..." />
      <CommandList>
        <CommandEmpty>No players found.</CommandEmpty>
        <CommandGroup>
          {users.map((user) => {
            const includesThisUser = participants.some(
              ({ email }) => email === user.email,
            )
            const participant = participants.find(
              ({ email }) => email === user.email,
            )
            return (
              <CommandItem key={user.email}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      checked={includesThisUser}
                      onCheckedChange={(checked) => {
                        const newChecked = checked.valueOf()
                        if (newChecked) {
                          setParticipants(prev => [
                            ...prev,
                            {
                              email: user.email,
                              startTime: startTime.unix(),
                              endTime: endTime.unix(),
                            },
                          ])
                        }
                        else {
                          setParticipants(prev => [
                            ...prev.filter(({ email }) => user.email !== email),
                          ])
                        }
                      }}
                      name={`checkbox-${user.email}`}
                      id={`checkbox-${user.email}`}
                      className="mr-2"
                    />
                    <Label
                      htmlFor={`checkbox-${user.email}`}
                      className="w-full"
                    >
                      {user.name}
                    </Label>
                  </div>
                  {participant && (
                    <Popover>
                      <PopoverTrigger>
                        <Edit size={16} className="pr-1" />
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex w-full flex-col">
                          <div className="flex w-full items-center gap-2">
                            <Checkbox
                              checked={
                                participant?.startTime === startTime.unix() &&
                                participant?.endTime === endTime.unix()
                              }
                              onClick={() => {
                                if (
                                  participant.startTime === startTime.unix() &&
                                  participant.endTime === endTime.unix()
                                )
                                  return
                                handleParticipantUpdateFactory(user, {
                                  startTime: startTime.unix(),
                                  endTime: endTime.unix(),
                                })()
                              }}
                              id={`played-full-${user.email}`}
                            />
                            <Label
                              htmlFor={`played-full-${user.email}`}
                              className="w-full"
                            >
                              Played full hours
                            </Label>
                          </div>

                          <Label
                            htmlFor={`startTime-${user.email}`}
                            className="mt-3"
                          >
                            Start time
                          </Label>
                          <Input
                            value={dayjs(participant.startTime * 1000).format(
                              'YYYY-MM-DDTHH:mm',
                            )}
                            onChange={handleParticipantUpdateFactory(
                              user,
                              e => ({
                                startTime: dayjs(e.target.value).unix(),
                              }),
                            )}
                            id={`startTime-${user.email}`}
                            type="datetime-local"
                            className="mb-3"
                          />

                          <Label htmlFor={`endTime-${user.email}`}>
                            End time
                          </Label>
                          <Input
                            value={dayjs(participant.endTime * 1000).format(
                              'YYYY-MM-DDTHH:mm',
                            )}
                            onChange={handleParticipantUpdateFactory(
                              user,
                              e => ({
                                endTime: dayjs(e.target.value).unix(),
                              }),
                            )}
                            id={`endTime-${user.email}`}
                            type="datetime-local"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

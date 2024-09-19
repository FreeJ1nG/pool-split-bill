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
import { toFixedIfNeeded } from '~/lib/utils.ts'
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
          const toBeDeleted = prev.find(p => p.user.email === user.email)

          if (!toBeDeleted) return [...prev]

          const newValue =
            typeof newValueFactory === 'function' && event
              ? newValueFactory(event)
              : newValueFactory

          return [
            ...prev.filter(p => p.user.email !== user.email),
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
            const participant = participants.find(
              ({ user: { email } }) => email === user.email,
            )
            return (
              <CommandItem key={user.email}>
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox
                      checked={!!participant}
                      onCheckedChange={(checked) => {
                        const newChecked = checked.valueOf()
                        if (newChecked) {
                          setParticipants(prev => [
                            ...prev,
                            {
                              user,
                              startTime: startTime.unix(),
                              endTime: endTime.unix(),
                            },
                          ])
                        }
                        else {
                          setParticipants(prev => [
                            ...prev.filter(
                              ({ user: { email } }) => user.email !== email,
                            ),
                          ])
                        }
                      }}
                      name={`checkbox-${user.email}`}
                      id={`checkbox-${user.email}`}
                      className="mr-2"
                    />
                    <Label
                      htmlFor={`checkbox-${user.email}`}
                      className="min-w-32 max-w-32 overflow-hidden text-ellipsis text-nowrap"
                    >
                      {user.name}
                    </Label>
                  </div>
                  {participant && (
                    <div className="border-400 text-nowrap rounded-3xl border border-gray-700 px-2 py-1 text-[10px] font-medium leading-none">
                      {participant.startTime === startTime.unix() &&
                        participant.endTime === endTime.unix()
                        ? 'Full hours'
                        : `${toFixedIfNeeded((participant.endTime - participant.startTime) / 60)} minutes`}
                    </div>
                  )}
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

'use client'

import { Button } from '@/components/shared/Button'
import DatePickerButton from '@/components/shared/DatePickerButton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { UserBetGroup } from '@/types/domain'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const groupEditSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100),
  challenge: z.string().max(500).optional().nullable(),
  isPrivate: z.boolean(),
  deadlineAt: z.date().min(new Date(), 'Data deve ser no futuro'),
  allowPublicViewing: z.boolean(),
})

type GroupEditFormValues = z.infer<typeof groupEditSchema>

interface GroupEditFormProps {
  group: UserBetGroup
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GroupEditFormValues) => Promise<void>
}

export function GroupEditForm({
  group,
  isOpen,
  onClose,
  onSubmit,
}: GroupEditFormProps) {
  const form = useForm<GroupEditFormValues>({
    resolver: zodResolver(groupEditSchema),
    defaultValues: {
      name: group.name,
      challenge: group.challenge ?? '',
      isPrivate: group.isPrivate,
      deadlineAt: new Date(group.deadlineAt),
      allowPublicViewing: group.allowPublicViewing,
    },
  })

  const handleSubmit = async (data: GroupEditFormValues) => {
    try {
      await onSubmit(data)
      onClose()
    } catch (error) {
      console.error('Failed to update group:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Grupo</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu grupo de apostas
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Grupo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Liga dos Amigos"
                      {...field}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Challenge Field */}
            <FormField
              control={form.control}
              name="challenge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Desafio (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o desafio ou regras especiais..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ''}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Adicione uma descrição ou regras especiais para o grupo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline Field */}
            <FormField
              control={form.control}
              name="deadlineAt"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Prazo Final *</FormLabel>
                  <FormControl>
                    <DatePickerButton
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Data e hora limite para submissão de apostas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Privacy Settings */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="text-sm font-medium">
                Configurações de Privacidade
              </h3>

              <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">
                        Grupo Privado
                      </FormLabel>
                      <FormDescription>
                        Apenas membros convidados podem participar
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowPublicViewing"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base cursor-pointer">
                        Visualização Pública
                      </FormLabel>
                      <FormDescription>
                        Permitir que não-membros vejam as apostas
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Alterações'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

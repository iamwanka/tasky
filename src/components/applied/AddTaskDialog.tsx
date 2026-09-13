import { useRef, useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog"
import { Field, FieldLabel, FieldSet, FieldLegend } from "../ui/field"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Plus, Trash2 } from "lucide-react"

type AddTaskDialogProps = {
  onCreateTask: (title: string, subtaskTitles: string[]) => void
}

type SubtaskDraft = { key: string; value: string }

function emptyDraft(): SubtaskDraft {
  return { key: crypto.randomUUID(), value: "" }
}

/**
 * Creates a task together with all of its subtasks in one modal.
 * - Dialog is controlled (open/onOpenChange) so a successful submit can
 *   close it explicitly — wrapping the submit button in DialogClose would
 *   close the dialog even when the title is empty, since its click and the
 *   form's native submit both fire on the same click with no way to block it.
 * - Each subtask row intercepts Enter (preventDefault) to add the next row
 *   instead of submitting the form early, mirroring how Notion/Linear/Todoist
 *   handle "add several items quickly."
 */
function AddTaskDialog({ onCreateTask }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [subtaskDrafts, setSubtaskDrafts] = useState<SubtaskDraft[]>([emptyDraft()])
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const canSubmit = title.trim().length > 0

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setTitle("")
      setSubtaskDrafts([emptyDraft()])
    }
  }

  function updateDraft(key: string, value: string) {
    setSubtaskDrafts(prev => prev.map(d => (d.key === key ? { ...d, value } : d)))
  }

  function addDraftAfter(key: string) {
    const draft = emptyDraft()
    setSubtaskDrafts(prev => {
      const idx = prev.findIndex(d => d.key === key)
      const next = [...prev]
      next.splice(idx + 1, 0, draft)
      return next
    })
    requestAnimationFrame(() => inputRefs.current[draft.key]?.focus())
  }

  function removeDraft(key: string) {
    setSubtaskDrafts(prev => (prev.length === 1 ? prev : prev.filter(d => d.key !== key)))
  }

  function handleDraftKeyDown(e: React.KeyboardEvent<HTMLInputElement>, key: string) {
    if (e.key === "Enter") {
      e.preventDefault()
      addDraftAfter(key)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return

    const subtaskTitles = subtaskDrafts
      .map(d => d.value.trim())
      .filter(v => v.length > 0)

    onCreateTask(title, subtaskTitles)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-14 h-14 fixed bottom-12 right-12" size="icon-lg" aria-label="Nueva tarea">
          <Plus />
        </Button>
      </DialogTrigger>


      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
          <DialogDescription>
            Agrega la tarea y sus subtareas de una sola vez.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <Field>
            <FieldLabel htmlFor="new-task-title">Título</FieldLabel>
            <Input
              id="new-task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la tarea"
              autoFocus
            />
          </Field>

          <FieldSet>
            <FieldLegend variant="label">Subtareas</FieldLegend>
            {subtaskDrafts.map((draft) => (
              <Field key={draft.key} orientation="horizontal">
                <Input
                  ref={(el) => { inputRefs.current[draft.key] = el }}
                  value={draft.value}
                  onChange={(e) => updateDraft(draft.key, e.target.value)}
                  onKeyDown={(e) => handleDraftKeyDown(e, draft.key)}
                  placeholder="Título de la subtarea"
                  aria-label="Título de la subtarea"
                  className="h-8"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Quitar subtarea"
                  disabled={subtaskDrafts.length === 1}
                  onClick={() => removeDraft(draft.key)}
                >
                  <Trash2 />
                </Button>
              </Field>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => addDraftAfter(subtaskDrafts[subtaskDrafts.length - 1].key)}
            >
              <Plus />
              Agregar otra subtarea
            </Button>
          </FieldSet>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit}>Crear tarea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddTaskDialog

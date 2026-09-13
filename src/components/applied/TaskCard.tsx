import { useState } from "react"
import type { Task } from "@/types/task"
import { cn } from "@/lib/utils"
import { EXIT_ANIMATION_MS } from "@/lib/tasks"
import { Card } from "../ui/card"
import { AccordionTrigger, AccordionContent } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Field, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { MoreVertical, Plus, Trash2 } from "lucide-react"
import StrikeText from "./StrikeText"

type TaskCardProps = {
  task: Task
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onAddSubtask: (taskId: string, subtaskTitle: string) => void
  /** True while this task's delete animation is playing — App.tsx delays the
   * actual removal until it finishes. */
  isRemoving: boolean
}

/**
 * A single task row inside the accordion.
 * - Has subtasks: renders as an accordion item (tap the title to expand/collapse).
 * - No subtasks: nothing to expand, so it renders as a plain checkbox row instead,
 *   completed directly via onToggleTask.
 */

function TaskCard({
  task,
  onToggleSubtask,
  onToggleTask,
  onDeleteTask,
  onDeleteSubtask,
  onAddSubtask,
  isRemoving,
}: TaskCardProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [removingSubtaskId, setRemovingSubtaskId] = useState<string | null>(null)

  function handleAddSubtask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onAddSubtask(task.id, newSubtaskTitle)
    setNewSubtaskTitle("")
  }

  // Same "wait for the animation, then touch state" pattern as deleteTask in
  // App.tsx, just scoped to one row instead of the whole card.
  function handleDeleteSubtask(subtaskId: string) {
    setRemovingSubtaskId(subtaskId)
    window.setTimeout(() => {
      onDeleteSubtask(task.id, subtaskId)
      setRemovingSubtaskId(null)
    }, EXIT_ANIMATION_MS)
  }

  const taskMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Task options">
          <MoreVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem variant="destructive" onClick={() => onDeleteTask(task.id)}>
          <Trash2 />
          Delete task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <Card
      className={cn(
        "animate-in px-6 py-2 fade-in-0 slide-in-from-top-1 duration-200",
        isRemoving && "pointer-events-none animate-out fade-out-0 zoom-out-95"
      )}
    >
      {task.subtasks.length === 0 ?
        <div className="flex items-center justify-between gap-2 py-2.5">
          <div className="flex flex-1 items-center gap-2">
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={() => onToggleTask(task.id)}
            />
            <FieldLabel htmlFor={task.id}>
              <StrikeText done={task.completed}>{task.title}</StrikeText>
            </FieldLabel>
          </div>
          {taskMenu}
        </div>
        :
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2">
                  <StrikeText done={task.completed}>{task.title}</StrikeText>
                  <Badge variant="secondary" className="font-mono tabular-nums">
                    {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                  </Badge>
                </div>
              </AccordionTrigger>
            </div>
            {taskMenu}
          </div>
          <AccordionContent>
            {
              task.subtasks.map((sub) => (
                <Field
                  key={sub.id}
                  orientation="horizontal"
                  className={cn(
                    "animate-in fade-in-0 slide-in-from-top-1 duration-200",
                    removingSubtaskId === sub.id &&
                      "pointer-events-none animate-out fade-out-0 slide-out-to-right-2"
                  )}
                >
                  <Checkbox
                    id={sub.id}
                    checked={sub.completed}
                    onCheckedChange={() => onToggleSubtask(task.id, sub.id)}
                  />
                  <FieldLabel className="flex-1" htmlFor={sub.id}>
                    <StrikeText done={sub.completed}>{sub.title}</StrikeText>
                  </FieldLabel>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete subtask"
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </Field>
              ))
            }
            <form onSubmit={handleAddSubtask} className="mt-1 flex items-center gap-2 py-1">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                aria-label="New subtask title"
                className="h-8 border-dashed"
              />
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Add subtask">
                <Plus />
              </Button>
            </form>
          </AccordionContent>
        </>

      }
    </Card>
  )
}

export default TaskCard

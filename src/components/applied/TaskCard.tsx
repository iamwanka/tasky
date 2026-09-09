import { useState } from "react"
import type { Task } from "@/types/task"
import { Card } from "../ui/card"
import { AccordionTrigger, AccordionContent } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Field, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { MoreVertical, Plus, Trash2 } from "lucide-react"

type TaskCardProps = {
  task: Task
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onToggleTask: (taskId: string) => void
  onDeleteTask: (taskId: string) => void
  onDeleteSubtask: (taskId: string, subtaskId: string) => void
  onAddSubtask: (taskId: string, subtaskTitle: string) => void
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
}: TaskCardProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  function handleAddSubtask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onAddSubtask(task.id, newSubtaskTitle)
    setNewSubtaskTitle("")
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
    <Card className="px-6 py-2">
      {task.subtasks.length === 0 ?
        <div className="flex items-center justify-between gap-2 py-2.5">
          <div className="flex flex-1 items-center gap-2">
            <Checkbox
              id={task.id}
              checked={task.completed}
              onCheckedChange={() => onToggleTask(task.id)}
            />
            <FieldLabel htmlFor={task.id} className={task.completed ? "text-muted-foreground line-through" : ""}>
              {task.title}
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
                  <span className={task.completed ? "text-muted-foreground line-through" : ""}>
                    {task.title}
                  </span>
                </div>
              </AccordionTrigger>
            </div>
            {taskMenu}
          </div>
          <AccordionContent>
            {
              task.subtasks.map((sub) => (
                <Field key={sub.id} orientation="horizontal">
                  <Checkbox
                    id={sub.id}
                    checked={sub.completed}
                    onCheckedChange={() => onToggleSubtask(task.id, sub.id)}
                  />
                  <FieldLabel
                    className={sub.completed ? "text-muted-foreground line-through flex-1" : "flex-1"}
                    htmlFor={sub.id}>
                    {sub.title}
                  </FieldLabel>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete subtask"
                    onClick={() => onDeleteSubtask(task.id, sub.id)}
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

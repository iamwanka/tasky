import type { Task } from "@/types/task"
import { Card } from "../ui/card"
import { AccordionTrigger, AccordionContent } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Field, FieldLabel } from "../ui/field"

type TaskCardProps = {
  task: Task
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  onToggleTask: (taskId: string) => void
}

/**
 * A single task row inside the accordion.
 * - Has subtasks: renders as an accordion item (tap the title to expand/collapse).
 * - No subtasks: nothing to expand, so it renders as a plain checkbox row instead,
 *   completed directly via onToggleTask.
 */

function TaskCard({ task, onToggleSubtask, onToggleTask }: TaskCardProps) {
  return (
    <Card className="px-6 py-2">
      {task.subtasks.length === 0 ?
        <div className="flex items-center gap-2 py-2.5">
          <Checkbox
            id={task.id}
            checked={task.completed}
            onCheckedChange={() => onToggleTask(task.id)}
          />
          <FieldLabel htmlFor={task.id} className={task.completed ? "text-muted-foreground line-through" : ""}>
            {task.title}
          </FieldLabel>
        </div>
        :
        <>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <span className={task.completed ? "text-muted-foreground line-through" : ""}>
                {task.title}
              </span>
            </div>
          </AccordionTrigger>
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
                    className={sub.completed ? "text-muted-foreground line-through" : ""}
                    htmlFor={sub.id}>
                    {sub.title}
                  </FieldLabel>
                </Field>
              ))
            }
          </AccordionContent>
        </>

      }
    </Card>
  )
}

export default TaskCard

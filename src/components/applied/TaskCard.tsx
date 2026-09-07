import type { Task } from "@/types/task"
import { Card } from "../ui/card"
import { AccordionTrigger, AccordionContent } from "../ui/accordion"
import { Checkbox } from "../ui/checkbox"
import { Field, FieldLabel } from "../ui/field"

type TaskCardProps = {
  task: Task
  onToggleSubtask: (taskId: string, subtaskId: string) => void
}

function TaskCard({ task, onToggleSubtask }: TaskCardProps) {
  return (
    <Card className="px-6 py-2">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-2">
          <span className={task.completed ? "text-muted-foreground line-through" : ""}>
            {task.title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {task.subtasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No hay subtareas</p>
        ) : (
          task.subtasks.map((sub) => (
            <Field key={sub.id} orientation="horizontal">
              <Checkbox
                checked={sub.completed}
                onCheckedChange={() => onToggleSubtask(task.id, sub.id)}
              />
              <FieldLabel className={sub.completed ? "text-muted-foreground line-through" : ""}>
                {sub.title}
              </FieldLabel>
            </Field>
          ))
        )}
      </AccordionContent>
    </Card>
  )
}

export default TaskCard

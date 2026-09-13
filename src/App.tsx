import { useState } from 'react'
import './App.css'
import { toast } from 'sonner'
import type {
  Task,
  Subtask
} from '@/types/task'
import {
  Accordion,
  AccordionItem
} from '@components/ui/accordion'
import TaskCard from './components/applied/TaskCard'
import AddTaskDialog from './components/applied/AddTaskDialog'
import { computeCompleted, EXIT_ANIMATION_MS } from '@/lib/tasks'

function App() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'ha138',
      title: 'Realizar planeación de proyecto de software',
      completed: false,
      createdAt: '2026-09-07 16:46:24',
      subtasks: [
        { id: 'sub-1', title: 'Definir alcance', completed: false },
        { id: 'sub-2', title: 'Levantar requisitos', completed: true },
      ],
    },
    {
      id: 'ha1139',
      title: 'Realizar busqueda binaria de proyecto de software',
      completed: false,
      createdAt: '2026-09-07 16:46:24',
      subtasks: [
        { id: 'sub-3', title: 'Escribir pruebas unitarias', completed: false },
      ],
    },
    {
      id: 'haq24893',
      title: 'Realizar busqueda binaria de proyectos',
      completed: false,
      createdAt: '2026-09-07 14:34:23',
      subtasks: []
    }
  ])

  const [removingTaskId, setRemovingTaskId] = useState<string | null>(null)

  function toggleSubtask(taskId: string, subtaskId: string) {
    setTasks(prev =>
      prev.map(t => {
        if (t.id !== taskId) return t;

        const newSubtasks = t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );

        return {
          ...t,
          subtasks: newSubtasks,
          completed: computeCompleted(newSubtasks),
        }


      })
    )
  }
  function toggleTask(taskId: string) {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ?
          { ...task, completed: !task.completed }
          :
          task
      )

    )

  }

  // Deletion waits for the exit animation to finish before touching state,
  // so the row visibly fades/zooms out instead of vanishing instantly.
  function deleteTask(taskId: string) {
    const removedTask = tasks.find(t => t.id === taskId)
    if (!removedTask) return

    setRemovingTaskId(taskId)
    window.setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      setRemovingTaskId(null)

      toast('Task deleted', {
        description: removedTask.title,
        action: {
          label: 'Undo',
          onClick: () => setTasks(prev => [...prev, removedTask]),
        },
      })
    }, EXIT_ANIMATION_MS)
  }

  function deleteSubtask(taskId: string, subtaskId: string) {
    setTasks(prev =>
      prev.map(task => {
        if (task.id !== taskId) return task

        const newSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId)
        return {
          ...task,
          subtasks: newSubtasks,
          completed: computeCompleted(newSubtasks),
        }
      })
    )
  }


  // Builds the whole task (with its subtasks already inside) and appends it
  // in one setTasks call — addTask's id lives only inside its own updater,
  // so calling addTask then addSubtask in a loop would have no id to target.
  function addTaskWithSubtasks(title: string, subtaskTitles: string[]) {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const subtasks: Subtask[] = subtaskTitles
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => ({ id: crypto.randomUUID(), title: t, completed: false }))

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      completed: computeCompleted(subtasks),
      createdAt: new Date().toISOString(),
      subtasks,
    }

    setTasks(prev => [...prev, newTask])
  }

  function addSubtask(taskId: string, subtaskTitle: string) {
    const trimmed = subtaskTitle.trim()
    if (!trimmed) return

    const newSubtask: Subtask = {
      title: trimmed,
      id: crypto.randomUUID(),
      completed: false
    }
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ?
          {
            ...task,
            subtasks: [...task.subtasks, newSubtask]
          }
          :
          task
      )
    )
  }

  const doneTaskCount = tasks.filter(t => t.completed).length
  const progressPercent = tasks.length > 0 ? (doneTaskCount / tasks.length) * 100 : 0

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Cola de tareas</h1>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-sm font-medium tabular-nums">
              {doneTaskCount} / {tasks.length}
            </span>
            <span className="text-sm text-muted-foreground">tareas completadas</span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        <AddTaskDialog onCreateTask={addTaskWithSubtasks} />

        {tasks.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="font-medium">La cola está vacía</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Añade tu primera tarea arriba para empezar.
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {tasks.map(task => (
              <AccordionItem key={task.id} value={task.id} className="border-none">
                <TaskCard
                  task={task}
                  onToggleSubtask={toggleSubtask}
                  onToggleTask={toggleTask}
                  onDeleteTask={deleteTask}
                  onDeleteSubtask={deleteSubtask}
                  onAddSubtask={addSubtask}
                  isRemoving={removingTaskId === task.id}
                />
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}

export default App

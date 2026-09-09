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
import { Input } from '@components/ui/input'
import { Button } from '@components/ui/button'
import { Plus } from 'lucide-react'
import TaskCard from './components/applied/TaskCard'

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

  const [newTaskTitle, setNewTaskTitle] = useState('')

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
          completed: newSubtasks.length > 0 && newSubtasks.every(s => s.completed),
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

  function deleteTask(taskId: string) {
    const removedTask = tasks.find(t => t.id === taskId)
    if (!removedTask) return

    setTasks(prev =>
      prev.filter(t => t.id !== taskId)
    )

    toast('Task deleted', {
      description: removedTask.title,
      action: {
        label: 'Undo',
        onClick: () => setTasks(prev => [...prev, removedTask]),
      },
    })
  }

  function deleteSubtask(taskId: string, subtaskId: string) {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ?
          {
            ...task,
            subtasks: task.subtasks.filter(subtask => subtask.id !== subtaskId)
          }
          :
          task
      )
    )
  }


  function addTask(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return

    setTasks(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: trimmed,
        completed: false,
        createdAt: new Date().toISOString(),
        subtasks: [],
      },
    ])
  }

  function handleAddTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    addTask(newTaskTitle)
    setNewTaskTitle('')
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

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <form onSubmit={handleAddTask} className="mb-4 flex gap-2">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            aria-label="New task title"
          />
          <Button type="submit" size="icon" aria-label="Add task">
            <Plus />
          </Button>
        </form>
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
              />
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

export default App

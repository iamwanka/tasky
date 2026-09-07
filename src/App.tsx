import { useState } from 'react'
import './App.css'
import type {
  Task
} from '@/types/task'
import {
  Accordion,
  AccordionItem
} from '@components/ui/accordion'
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
  ])



  function toggleSubtask(taskId: string, subtaskId: string) {
    setTasks(prev =>
      prev.map(t =>
        t.id !== taskId
          ? t
          : (() => {
            const newSubtasks = t.subtasks.map(s => 
              s.id === subtaskId? {...s, completed: !s.completed}: s
            );
            return {
              ...t,
              subtasks: newSubtasks,
              completed: newSubtasks.length > 0 && newSubtasks.every(s => s.completed),
            }
          })()
          
          
      )
    )
  }

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">
        <Accordion type="single" collapsible className="flex flex-col gap-3">
          {tasks.map(task => (
            <AccordionItem key={task.id} value={task.id} className="border-none">
              <TaskCard
                task={task}
                onToggleSubtask={toggleSubtask}
              />
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}

export default App

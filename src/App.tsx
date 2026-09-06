import { useEffect, useState } from 'react'
import './App.css'
import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/ui/card'
import {
  FieldGroup,
  FieldLabel,
  Field
} from '@components/ui/field'

import {
  Checkbox
} from '@components/ui/checkbox'

type Task = {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

const STORAGE_KEY = 'task-queue-app.tasks'

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

function App() {


  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.3fr_0.9fr]">
        <Card>

          <CardHeader>
            <CardTitle>Tarea de Proyecto de Software</CardTitle>
            <CardDescription>Dividir la tarea en partes más especificas</CardDescription>
          </CardHeader>

          <CardContent>
            <FieldGroup>
            </FieldGroup>
              <Field orientation="horizontal">
                <Checkbox />
                <FieldLabel>
                  Hacer la tarea de Cultura y Deporte
                </FieldLabel>
                
              </Field>
              <Field orientation="horizontal">
                <Checkbox />
                <FieldLabel>
                  Hacer la tarea de Cultura y Deporte
                </FieldLabel>
              </Field>
          </CardContent>
          <CardFooter>Pie de Card</CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App

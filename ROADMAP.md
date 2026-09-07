# Task Queue App — Build Plan

Current state: Vite + React 19 + Tailwind v4 + shadcn scaffolded. `accordion`, `card`,
`checkbox`, `dialog`, `dropdown-menu`, `field` components are installed but mostly unused.
`App.tsx` renders two hardcoded checkbox rows inside one `Card` — no state, no data model,
no persistence yet.

## Roadmap

### Phase 1 — Data model & state (do this before anything visual)
Define the `Task` type properly, including subtasks:
```ts
type Subtask = { id: string; title: string; completed: boolean }
type Task = { id: string; title: string; completed: boolean; createdAt: string; subtasks: Subtask[] }
```
Move tasks into `useState<Task[]>` in `App.tsx` (or a custom hook `useTasks()` later).

**Learn:** `useState`, why React re-renders on state change, and the rule that state updates
must be immutable (never `task.subtasks.push(...)`, always return a new array/object).

### Phase 2 — Render from state, not hardcoded JSX
`tasks.map(task => <TaskCard key={task.id} task={task} />)`.

**Learn:** rendering lists, why `key` matters, and splitting a growing component into smaller
ones (`TaskCard`, `SubtaskList`).

### Phase 3 — Expand/collapse interaction (immediate next step)
See "Expand-on-tap feature" below.

### Phase 4 — CRUD
- Add task (Input + Button, or a `Dialog` for a proper "New Task" form).
- Toggle complete (already have `Checkbox`, just wire `onCheckedChange`).
- Delete task/subtask (`Button` with a trash icon, maybe a `DropdownMenu` per card for
  "Edit / Delete").

**Learn:** controlled inputs (`value` + `onChange`), passing callbacks down as props
(`onToggle`, `onDelete`).

### Phase 5 — Persistence
`STORAGE_KEY` is already declared — actually use it: `localStorage.getItem` on load, a
`useEffect` to save on every change.

**Learn:** `useEffect` and dependency arrays.

### Phase 6 — Polish
Empty states, `Badge` for subtask counts ("2/5 done"), maybe drag-reorder later, filters
(all/active/done).

Do these roughly in order — expand/collapse (phase 3) depends on phase 1/2.

## Expand-on-tap feature — what to learn

The core idea isn't shadcn-specific, it's a React concept: **"is this card open?" is state,
not something you toggle in the DOM directly.** You click → a state value changes → React
re-renders → the JSX conditionally shows the subtasks. That's the whole trick, in every
framework.

Two ways to implement it:

### Option A — use the `Accordion` component (already installed)
Radix's Accordion primitive (wrapped by shadcn) already manages "which item is open" for
you — no need for your own `useState` for the open/closed part. Map each task to an
`AccordionItem`, put the checkbox+title in `AccordionTrigger` (the clickable part), and the
subtasks in `AccordionContent`:

```tsx
<Accordion type="single" collapsible>
  {tasks.map(task => (
    <AccordionItem key={task.id} value={task.id}>
      <AccordionTrigger>
        <span className="flex items-center gap-2">
          <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} />
          {task.title}
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {task.subtasks.map(sub => (
          <Field key={sub.id} orientation="horizontal">
            <Checkbox checked={sub.completed} onCheckedChange={() => toggleSubtask(task.id, sub.id)} />
            <FieldLabel>{sub.title}</FieldLabel>
          </Field>
        ))}
      </AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

Put this whole `Accordion` inside the existing `Card`, replacing the hardcoded `Field`s.
`type="single" collapsible` means one card open at a time (tap again to close); use
`type="multiple"` if several can be open simultaneously.

### Option B — roll your own with `useState` (good exercise)
Keep a `Set<string>` of expanded task ids in `App`, toggle membership on click, and
conditionally render the subtask list with `{isExpanded && <SubtaskList .../>}`. This is
what `Accordion` does internally, minus the animation — worth trying once you understand
what the component gives you for free.

**Suggested order:** wire it with `Accordion` first (fast, and it teaches the
`value`/`onValueChange`/controlled-vs-uncontrolled pattern you'll reuse for `Dialog` and
`DropdownMenu` later). Then, as a learning exercise once it works, rebuild the same
behavior with plain `useState` — that's when "state drives the UI" really sticks.

## Guide: auto-complete a task when all its subtasks are done

**Goal:** when the last unchecked subtask under a task gets checked, the task's own
`completed` flips to `true` automatically — no separate click on the task's checkbox
needed. (Decide for yourself: should unchecking one subtask afterward un-complete the
task again? Recommended: yes, otherwise the checkbox can lie.)

### Two ways to think about it, and why one is better

**Option A — synchronize with `useEffect`.** Watch `tasks` in an effect; when a task's
subtasks are all completed, call `setTasks` again to flip `completed`.
Downside: this is exactly the pattern React's docs warn about in *"You Might Not Need an
Effect"* — you'd use an Effect to keep two pieces of state in sync that both live in the
same object. Click a subtask → render → effect runs → second `setState` → second render.
Two renders for one user action, plus a risk of loops if the dependency array is wrong.

**Option B (recommended) — derive `completed` in the same update that changes the
subtasks.** `toggleSubtask` already builds a new `subtasks` array for the target task.
Before returning the new task object, compute whether every subtask in *that new array*
is completed, and set `completed` to that value in the same object. One state update, one
render, no effect.

### Steps (Option B)

1. Open `toggleSubtask` in `App.tsx`.
2. Inside the branch where `t.id === taskId`, pull the mapped array into its own variable
   first instead of inlining it twice, e.g. `const newSubtasks = t.subtasks.map(...)`.
3. Compute `const allDone = newSubtasks.length > 0 && newSubtasks.every(s => s.completed)`.
   - The `length > 0` guard matters: `[].every(...)` is `true` on an empty array (vacuous
     truth), so without the guard a task with zero subtasks would "complete" itself
     instantly.
4. Return `{ ...t, subtasks: newSubtasks, completed: allDone }` instead of the current
   `{ ...t, subtasks: newSubtasks }`.
5. **Test it:** check every subtask under a task one at a time — the task's own checkbox
   should flip to checked (and strike through) the moment the last one is checked.
   Uncheck one — the task should un-check again, since `allDone` recomputes every time.

### Edge cases to decide for yourself

- **Task with no subtasks:** unaffected — `toggleTask` still drives it directly, since
  `toggleSubtask` never touches a task with an empty `subtasks` array.
- **Manually toggling the task's own checkbox when it *does* have subtasks:** today
  `toggleTask` only flips `task.completed` and leaves the subtasks alone — the next time
  any subtask is toggled, `allDone` recomputes and can silently override what you just set
  by hand. Decide if that's fine, or whether checking the parent by hand should cascade
  and check all its subtasks too (same "derive together" idea, applied inside `toggleTask`
  instead, in the other direction).

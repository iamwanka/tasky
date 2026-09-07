# Task Queue App — Build Plan

_Last updated: 2026-09-07_

## Current state

Vite + React 19 + Tailwind v4 + shadcn. Tasks render as an `Accordion` — each task is a
card you tap to expand, revealing its subtasks. Checking every subtask automatically marks
the task itself complete. No add/delete yet, no persistence yet — everything lives in
in-memory `useState` seed data and resets on refresh.

**Files:**
- [src/types/task.tsx](src/types/task.tsx) — `Task` / `Subtask` types.
- [src/App.tsx](src/App.tsx) — owns `tasks` state, `toggleSubtask`, seed data.
- [src/components/applied/TaskCard.tsx](src/components/applied/TaskCard.tsx) — one
  task's accordion item (trigger = title, content = subtask list).

## Roadmap

### ~~Phase 1 — Data model & state~~ ✅ done
`Task` / `Subtask` types defined, `tasks` lives in `useState<Task[]>` in `App.tsx`.

### ~~Phase 2 — Render from state~~ ✅ done
`tasks.map(task => <TaskCard key={task.id} task={task} />)`, split into its own component.

### ~~Phase 3 — Expand/collapse + auto-complete~~ ✅ done
Built with `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` (see "What was
built" below) — not the original two-checkbox sketch. Also went a step further than the
original plan: there is **no independent task-level checkbox anymore**. A task's `completed`
is now fully *derived* from its subtasks (see the auto-complete section below), not toggled
by hand. That's a deliberate simplification, but it creates a known gap — see "Open gap" below.

### Phase 4 — CRUD (next up)
- **Add task**: `Input` + `Button`, or a `Dialog` for a proper "New Task" form. New tasks
  need a generated `id` (e.g. `crypto.randomUUID()`) and `createdAt`.
- **Add subtask**: same idea, scoped to one task — probably an input inside
  `AccordionContent`, below the existing subtask list.
- **Delete task/subtask**: a `Button` with a trash icon, or a `DropdownMenu` per card for
  "Edit / Delete".

**Learn:** controlled inputs (`value` + `onChange`), passing callbacks down as props
(the same "lift state up, pass handlers down" pattern already used for `onToggleSubtask`),
generating stable unique ids client-side.

**Suggested first step:** start with "delete subtask" — it reuses the exact `prev.map(t =>
t.id === taskId ? {...} : t)` skeleton `toggleSubtask` already uses, just with `.filter()`
instead of `.map()` on the inner `subtasks` array. Good warm-up before tackling "add," which
needs a form and id generation.

### Phase 5 — Persistence
Not started. `localStorage.getItem` on load (inside `useState`'s lazy initializer, or an
effect), a `useEffect` that writes to `localStorage.setItem` whenever `tasks` changes.

**Learn:** `useEffect` and dependency arrays; lazy `useState` initializers
(`useState(() => ...)`) to avoid reading `localStorage` on every render.

### Phase 6 — Polish
Empty states, `Badge` for subtask counts ("2/5 done"), maybe drag-reorder later, filters
(all/active/done).

## Open gap to resolve (found after Phase 3)

Since `toggleTask` was removed, **a task with zero subtasks can never be marked complete** —
there is currently no UI path to set `completed` on a task that has no subtasks to derive it
from. Decide before or during Phase 4:
- Restore a manual task-level checkbox, used only when `subtasks.length === 0`, or
- Require every task to have at least one subtask (simplest, but restricts what a "task" can be), or
- Bring back `toggleTask` for the no-subtasks case specifically, leaving the derived logic
  in `toggleSubtask` untouched for tasks that do have subtasks.

## What was built: expand/collapse with `Accordion`

Radix's Accordion primitive (wrapped by shadcn) manages "which item is open" internally —
no manual `useState` needed for that part. Final shape, in `TaskCard.tsx`:

```tsx
<Card>
  <AccordionTrigger>
    {/* clicking anywhere here toggles this card's own AccordionItem open/closed */}
    <span>{task.title}</span>
  </AccordionTrigger>
  <AccordionContent>
    {task.subtasks.map(sub => (
      <Field key={sub.id}>
        <Checkbox id={sub.id} checked={sub.completed} onCheckedChange={...} />
        <FieldLabel htmlFor={sub.id}>{sub.title}</FieldLabel>
      </Field>
    ))}
  </AccordionContent>
</Card>
```

`App.tsx` wraps each `TaskCard` in `<AccordionItem value={task.id}>`, all inside one
`<Accordion type="single" collapsible>` — `type="single"` means only one card is open at a
time; switch to `type="multiple"` if several should be expandable simultaneously.

**Key lesson — label/checkbox association:** clicking the subtask *text* didn't toggle the
checkbox at first, because `Checkbox` and `FieldLabel` were just two sibling elements with no
relationship. The fix wasn't a second `onClick` handler (that duplicates the toggle logic in
two places) — it's native HTML: give the `Checkbox` an `id`, give `FieldLabel` a matching
`htmlFor`, and the browser forwards clicks on the label to the associated control
automatically (this works because Radix's `Checkbox` renders as a real `<button>`, and
buttons are "labelable" elements per the HTML spec, same as `<input>`). One handler
(`onCheckedChange`), no duplication.

## Guide: auto-complete a task when all its subtasks are done

**Goal:** when the last unchecked subtask under a task gets checked, the task's own
`completed` flips to `true` automatically. Unchecking a subtask afterward un-completes the
task again (recomputed every time, not a one-way flag).

**Why derive it instead of using a `useEffect`:** a `useEffect` watching `tasks` to
re-flip `completed` after the fact would mean two renders per click (one for the subtask
toggle, one for the effect's follow-up `setState`) and is the exact pattern React's docs
warn about in *"You Might Not Need an Effect"* — using an Effect to sync two pieces of state
that live in the same object. Instead, `completed` is computed in the same state update that
changes `subtasks`, inside `toggleSubtask`:

```ts
function toggleSubtask(taskId: string, subtaskId: string) {
  setTasks(prev =>
    prev.map(t => {
      if (t.id !== taskId) return t
      const newSubtasks = t.subtasks.map(s =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      )
      return {
        ...t,
        subtasks: newSubtasks,
        completed: newSubtasks.length > 0 && newSubtasks.every(s => s.completed),
      }
    })
  )
}
```

The `newSubtasks.length > 0` guard matters: `[].every(...)` is `true` on an empty array
(vacuous truth), so without it a task with zero subtasks would instantly show as complete —
this is the same root cause as the "Open gap" above, just encountered from a different angle.

**Bugs hit while building this (for future reference — same mistakes cost real time):**
- Confusing "all tasks" with "one task's subtasks" — `prev.map(...)` produces the whole
  `Task[]`, `t.subtasks.map(...)` produces one task's `Subtask[]`. Don't reuse a variable
  name like `newSubtasks` for the wrong one of these.
- `.map().length == originalArray.length` is **always true** — `.map()` never changes
  array length, so this can never actually detect "are all of them done." Use `.every()`.
- Object spread is **three** dots (`...`), not two (`..`) — a two-dot typo produces a
  `TS1003: Identifier expected` parse error, not a runtime bug.
- An IIFE (`(() => { ... })`) does nothing unless *called*: `(() => { ... })()`, with the
  trailing `()`. Without it, the expression's value is the function itself, not its return
  value.

## Resume here tomorrow

1. Decide the "open gap" above (task with no subtasks) before or while starting Phase 4 —
   it'll shape how "add task" seeds a brand-new task's `completed` field.
2. Start Phase 4 with **delete subtask** (see "Suggested first step" above) as a warm-up,
   then **add subtask**, then **add task**, then **delete task**.
3. Phase 5 (persistence) is the natural stopping point after Phase 4 — right now every
   reload wipes progress back to the two seed tasks.

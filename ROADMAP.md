# Task Queue App — Build Plan

_Last updated: 2026-09-08_

## Current state

Vite + React 19 + Tailwind v4 + shadcn. Tasks render as an `Accordion`. A task **with**
subtasks is a card you tap to expand, revealing its subtasks — checking every subtask
automatically marks the task itself complete. A task with **no** subtasks renders as a
plain checkbox row instead (nothing to expand), and is completed by hand. No add/delete
yet, no persistence yet — everything lives in in-memory `useState` seed data and resets on
refresh.

**Files:**
- [src/types/task.tsx](src/types/task.tsx) — `Task` / `Subtask` types.
- [src/App.tsx](src/App.tsx) — owns `tasks` state, `toggleSubtask`, `toggleTask`, seed data.
- [src/components/applied/TaskCard.tsx](src/components/applied/TaskCard.tsx) — one
  task's row: accordion item if it has subtasks, plain checkbox row if it doesn't.

## Roadmap

### ~~Phase 1 — Data model & state~~ ✅ done
`Task` / `Subtask` types defined, `tasks` lives in `useState<Task[]>` in `App.tsx`.

### ~~Phase 2 — Render from state~~ ✅ done
`tasks.map(task => <TaskCard key={task.id} task={task} />)`, split into its own component.

### ~~Phase 3 — Expand/collapse + auto-complete~~ ✅ done
Built with `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` (see "What was
built" below) — not the original two-checkbox sketch. A task's `completed` is derived from
its subtasks when it has any (see the auto-complete guide below); for a task with zero
subtasks there's nothing to derive from, so it gets a plain manual checkbox instead — see
"Resolved: task with no subtasks" below for how that split works.

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

## Resolved: task with no subtasks

Previously an open gap: with `toggleTask` removed, a task with zero subtasks had no way to
ever become `completed`, since nothing derived it and nothing set it by hand.

**Fix:** `toggleTask` is back in `App.tsx`, but it's only wired up for the no-subtasks case.
`TaskCard` branches on `task.subtasks.length`:
- `0` → a plain `Checkbox` + `FieldLabel` row (no accordion at all — there's nothing to
  expand), driven by `onToggleTask`, which just flips `completed` directly.
- `> 0` → the `AccordionTrigger`/`AccordionContent` structure from Phase 3, driven by
  `onToggleSubtask`, which derives `completed` from the subtasks as before.

Both callbacks are passed into every `TaskCard`, but each one is only ever invoked from the
branch it belongs to — a task can't have both a manual checkbox and derived completion at
once. Small cleanup made alongside this: the no-subtasks row's className had been copied
wholesale from `AccordionTrigger`'s internal styles (including chevron-icon selectors for
an icon that's never rendered there), and used `items-start` where the equivalent
with-subtasks row uses `items-center` — both trimmed down to a plain
`"flex items-center gap-2 py-2.5"` so the two row types stay visually consistent and the
duplicate styling can't quietly drift out of sync with shadcn's own accordion styles later.

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
(vacuous truth), so without it a task with zero subtasks would instantly show as complete.
In practice this guard is now moot for that case specifically, since a zero-subtask task
never reaches `toggleSubtask` at all — see "Resolved: task with no subtasks" above — but
it's still correct defensive logic to keep.

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

1. Start Phase 4 with **delete subtask** (see "Suggested first step" above) as a warm-up,
   then **add subtask**, then **add task**, then **delete task**.
   - For "add task," decide up front whether a brand-new task starts with `subtasks: []`
     (renders as the plain-checkbox row) or requires at least one subtask before it can be
     created (always renders as an accordion item) — either is fine, just pick one so the
     `TaskCard` branch behaves predictably for freshly-created tasks.
2. Phase 5 (persistence) is the natural stopping point after Phase 4 — right now every
   reload wipes progress back to the three seed tasks.

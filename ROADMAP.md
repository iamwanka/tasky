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

**Design principles:**
1. Friction should match the cost of the action — add task/subtask is frequent and cheap
   → zero friction, inline. Delete task is rarer and costlier → needs a safety net, but not
   necessarily a blocking modal.
2. Affordances should be visible but quiet, not hover-only — hover doesn't exist on touch.
3. Consistent icon language — `lucide-react` is already a dependency; use it (`Plus`,
   `Trash2`, `MoreVertical`) to match the chevrons `Accordion` already shows.
4. Keyboard-first for quick-add — autofocus the input, Enter submits, Escape cancels,
   refocus after submit for rapid successive entries.
5. Never a blank screen — an empty task list needs a message + the same "add" affordance
   as its call-to-action.

**Add task:** inline "quick add" row pinned above the list (`Input` + `Plus`, placeholder
"Add a task…"), not a `Dialog` — a modal adds a click-open/type/click-close cycle to the
single most frequent action in the app. Save `Dialog` for if task creation ever needs more
than a title (due date, priority). New tasks need a generated `id` (e.g.
`crypto.randomUUID()`) and `createdAt`; decide whether a fresh task starts with
`subtasks: []` (renders as the plain-checkbox row from the "Resolved" section above) or
requires one subtask up front.

**Add subtask:** same idea, scoped: a subtle "+ Add subtask" input as the last row inside
`AccordionContent`, visually distinct from real subtasks (muted/dashed) so it isn't
mistaken for one.

**Delete subtask:** low cost, mentally reversible (just retype it). A quiet ghost
trash-icon `Button` at the end of the row, always visible (`text-muted-foreground`, shifts
to `text-destructive` on hover), deletes immediately — no confirmation needed.

**Delete task:** higher cost, can take several subtasks with it. Two options:
- **Toast + Undo (recommended):** delete immediately, show a dismissible toast "Task
  deleted · Undo" for a few seconds — zero friction for the confident case, full
  reversibility for the mistake (what Gmail/Todoist/Linear do). Needs
  `npx shadcn add sonner`.
- **AlertDialog confirm:** a blocking "Are you sure?" before deleting — simpler mentally,
  but adds a click+modal to every delete. Needs `npx shadcn add alert-dialog` (not the
  `Dialog` already installed — `AlertDialog` is the semantically-correct primitive for
  destructive confirmations: traps focus, forces an explicit choice).

Either way, put delete behind a small `⋮` `DropdownMenu` on the card rather than a bare
icon on the card face — keeps the resting card calm and gives "Edit" a home later too.

**Empty state:** when `tasks.length === 0`, swap the `Accordion` for a centered message
plus the same quick-add input, so the empty state doubles as the entry point.

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

## Guide: implementing Phase 4 CRUD

**Order, and why:** delete subtask → add subtask → add task → delete task. Each step
reuses the previous one's pattern and adds exactly one new concept, instead of learning
everything at once.

### 1. Delete subtask
**Goal:** remove one subtask; re-derive the parent's `completed` afterward, don't leave it stale.
1. Add `function deleteSubtask(taskId: string, subtaskId: string)` in `App.tsx`, same outer
   shape as `toggleSubtask`: `prev.map(t => t.id !== taskId ? t : { ... })`.
2. `const newSubtasks = t.subtasks.filter(s => s.id !== subtaskId)`.
3. Recompute `completed` with the same guarded expression already used in `toggleSubtask`:
   `newSubtasks.length > 0 && newSubtasks.every(s => s.completed)`.
4. Add a ghost trash-icon `Button` (lucide's `Trash2`) at the end of each subtask row,
   calling `onDeleteSubtask(task.id, sub.id)` — thread it through `TaskCard`'s props.

You're now writing the same `completed` derivation in two places (`toggleSubtask` and
`deleteSubtask`) — a legitimate case to extract a helper, e.g.
`const computeCompleted = (subs: Subtask[]) => subs.length > 0 && subs.every(s => s.completed)`,
called from both. This is the textbook case for when extraction is worth it: real
duplication, not a speculative one.

**Edge case:** deleting a task's *last* subtask brings `subtasks.length` to `0`, and since
`TaskCard` branches purely on that length, the card switches from accordion to
plain-checkbox layout mid-interaction. Decide if that's acceptable (recommended: yes).

**Test:** delete a subtask, confirm the list updates and `completed` recalculates; delete
the last subtask and confirm the card flips to the plain-checkbox row.

### 2. Add subtask
**Goal:** append a new, unchecked subtask to a task.
1. Id strategy: `crypto.randomUUID()` — built into the browser and Node, no new dependency.
2. `function addSubtask(taskId: string, title: string)` — guard empty input first:
   `if (!title.trim()) return`.
3. `prev.map(t => t.id !== taskId ? t : { ...t, subtasks: [...t.subtasks, { id: crypto.randomUUID(), title: title.trim(), completed: false }], completed: false })`.
   `completed: false` here isn't even strictly necessary — a freshly-added subtask is
   always incomplete, so `.every(...)` across the new array is already `false` on its own;
   unlike `toggleSubtask`, no special-case guard is needed here.
4. A small inline input at the end of `AccordionContent`'s subtask list: local `useState`
   for the text, `Enter` submits then clears and refocuses the input, `Escape`
   clears/blurs without submitting (per the quick-add principle in the UX guide above).

**Decision to park, not solve now:** should a zero-subtask task (the plain-checkbox row)
also get an "add subtask" control, promoting it into an accordion task? Recommended scope
cut: **no** — leave zero-subtask tasks as pure checkboxes for this pass; treat "promote a
checkbox task into a subtask-having one" as a Phase 6 polish item.

**Test:** type a title, press Enter — subtask appears unchecked, input clears and stays
focused; an empty/whitespace submit does nothing.

### 3. Add task
**Goal:** the pinned "quick add" row from the UX guide, appending a new top-level task.
1. `function addTask(title: string)` — same empty-guard as `addSubtask`.
2. `id: crypto.randomUUID()`; switch `createdAt` to `new Date().toISOString()` instead of
   hand-typed strings like the seed data has — this is where the long-unused `formatDate`
   function from Phase 1 finally becomes relevant, since it expects a parseable date string.
3. New tasks get `subtasks: []` and `completed: false` — per the scope cut above, every new
   task starts as a plain-checkbox row.
4. A small inline "add task" input (mirrors add-subtask, one level up), placed above the
   `<Accordion>` in `App.tsx`.
5. Append vs. prepend to the array: append matches `createdAt` chronological order; prepend
   puts the newest task in view without scrolling. Either is defensible — pick one and move on.

**Test:** add a few tasks, confirm each renders as a plain-checkbox row, confirm ordering
matches whichever you picked.

### 4. Delete task
**Goal:** remove a task, with a safety net proportional to its cost (per the UX guide above).

**Toast + undo (recommended):**
1. `npx shadcn add sonner`, mount `<Toaster />` once near the root (`main.tsx` or top of `App`).
2. `function deleteTask(taskId: string)`: capture the task first
   (`const removed = tasks.find(t => t.id === taskId)`), then
   `setTasks(prev => prev.filter(t => t.id !== taskId))`, then
   `toast("Task deleted", { action: { label: "Undo", onClick: () => setTasks(prev => [...prev, removed]) } })`.
   Known simplification: undo re-appends at the end, not necessarily the original position
   — fine for v1.

**`AlertDialog` confirm (alternative):**
1. `npx shadcn add alert-dialog`.
2. Wrap the delete trigger in `AlertDialog`/`AlertDialogTrigger`/`AlertDialogContent` with
   Cancel/Continue; Continue's `onClick` calls `deleteTask`.

Either way: put the trigger behind a small `⋮` `DropdownMenu` on the card (already
installed), not a bare icon on the card face.

**Test:** delete a task — with toast+undo, confirm Undo restores it; with the dialog,
confirm Cancel leaves it untouched and Continue removes it.

## Resume here tomorrow

1. Work through the CRUD guide above in order: delete subtask → add subtask → add task →
   delete task.
2. Phase 5 (persistence) is the natural stopping point after Phase 4 — right now every
   reload wipes progress back to the three seed tasks.

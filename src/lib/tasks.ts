import type { Subtask } from "@/types/task"

/**
 * A task is complete once it has at least one subtask and every subtask is
 * done — an empty list is never "complete" (avoids the vacuous-truth case
 * where [].every(...) === true).
 */
export function computeCompleted(subtasks: Subtask[]): boolean {
  return subtasks.length > 0 && subtasks.every(s => s.completed)
}

/** Duration (ms) of the fade/zoom-out on a deleted task or subtask row — keep in sync with the `duration-*` class used on the exit animation. */
export const EXIT_ANIMATION_MS = 200

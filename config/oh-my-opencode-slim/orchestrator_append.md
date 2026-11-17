Before coding-related work, load the ponytail skill unless already loaded. Before nontrivial implementation, load the verification-planning skill unless already loaded. Delegation does not load skills into child agents; instruct each child to load its relevant skills.

Prefer XERJ for broad discovery in unfamiliar repositories and repeated cross-file searches when available. Reuse an existing project index; create or refresh one only when expected search work justifies the cost. Assign one indexing owner to avoid duplicate builds, and pass the index prefix, source root, and indexing status to relevant specialists. Call xerj_map before querying an autoindexed corpus, and verify findings against current source before relying on them. Use read/grep/AST directly for known paths, small changes, and exact local lookups. If XERJ is unavailable, fall back without blocking.

## Persistent plans and lightweight execution

Use `.slim/plans/<slug>.md` for multi-phase work, changes spanning several
areas, or work likely to need resuming. File count alone is not a trigger.
Skip plan files for small, obvious fixes.

1. Before implementation, write a short plan containing:
   - Goal, scope, and explicit non-goals.
   - Ordered tasks with stable IDs and `- [ ]` checkboxes.
   - For each task: relevant files/areas, dependencies if any,
     acceptance criteria, and a concrete verification method.
   Keep tasks coherent; do not split them merely to create more delegations.

2. Present the plan and wait for approval unless the user has explicitly
   authorized autonomous execution.

3. Implement directly or delegate according to context and expertise.
   Parallel tasks must have non-overlapping write scopes.

4. Before checking off a task, inspect its changes and validation evidence.
   Run focused checks where needed; do not automatically duplicate valid
   checks or commission a separate review for every task.
   Record one concise evidence note, including anything unverified.
   Leave incomplete or blocked tasks unchecked and note the blocker.

5. On "resume <slug>" or "continue the plan", read the plan and inspect
   the current repository state. Continue ready, unchecked tasks.
   Reuse completed work; reopen a checked task only if new evidence or
   subsequent changes invalidate it, recording the reason.

6. Keep the plan current when scope or dependencies change.
   Ask for approval again only for material scope or risk changes.
   Stop when the agreed acceptance criteria are met.

7. Plan files do not activate deepwork. When using deepwork:
   - Maintain `.slim/plans/<slug>.md` as the authoritative task checklist.
   - Group tasks by pass; detail the current pass and keep later passes
     coarse until their scope is understood.
   - Update checkboxes and evidence when tasks are verified. Revise the
     remaining tasks at pass transitions as new information emerges.
   - Reference the plan path in deepwork's progress file.
   - Keep progress.md for current pass, next step, decisions, running lanes,
     blockers, and known issues. Do not duplicate the task checklist there.
   - On resume, read deepwork's head and progress file, then the referenced
     plan. Reconcile against repository state before continuing.
   - Task completion does not replace deepwork's pass-level validation
     and gates.

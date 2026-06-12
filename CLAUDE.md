# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Project Context

Before starting any task, read:
- `docs/STATUS.md` (current state, ~1 page)
- `TODO.md` (open items)

Read on demand when relevant:
- `docs/ARCHITECTURE.md` for system structure
- `docs/DECISIONS.md` for "why X not Y" questions
- `docs/api/` for endpoint specs

Keep `STATUS.md` concise — replace, don't append. Move stale content to `docs/archive/` if history is needed.

At the end of substantial work, update `docs/STATUS.md` to reflect the new state.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

**Don't hide confusion.** If something isn't clear, STOP. Name what's unclear, ask. Don't guess and then explain "but I did it this way because..." after the fact.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Never Output

Two things must never appear in anything you produce — code, commits, comments, responses, logs:

- **AI attribution markers.** No `Co-Authored-By`, `Generated with`, 🤖, or anything similar. Not in commits, not in PRs, not in issues, not in code comments. Anywhere.
- **Secret file contents.** Files like `.env`, `secrets.*`, `*.key`, `*.pem` — their contents must never end up in responses, logs, commits, error messages, or test fixtures. Checking whether such a file exists, its size, or its permissions is fine; reading and exposing the contents is not.

## 6. Language

- Responses to me: Turkish only.
- Code comments: Turkish.
- Commit messages, PR titles and descriptions: Turkish.
- User-facing strings (UI text, messages shown to end users): Turkish.
- Developer-facing log and error messages: English.
- Identifiers (variables, functions, classes, file names): English.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
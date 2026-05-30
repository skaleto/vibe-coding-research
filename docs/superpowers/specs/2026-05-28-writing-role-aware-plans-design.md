# Writing Role-Aware Plans — Skill Design

- **Date**: 2026-05-28
- **Status**: Design approved, pending implementation plan
- **Target location**: `~/.claude/skills/writing-role-aware-plans/`

## Background

Existing Claude Code multi-agent primitives form a chain:

```
brainstorming → writing-plans → subagent-driven-development (serial)
                              ↘ dispatching-parallel-agents (parallel)
```

All downstream skills assume **roles and tasks are already defined**. CrewAI / MetaGPT / AutoGen require explicit role declaration too. No skill currently covers "AI decides which roles to deploy" before plan execution — this gap is precisely the "auto role planning" gap the user identified.

Anthropic's design judgment is to put auto-dispatch at the **skill layer**, not the agent layer. This skill applies that principle one level deeper: it's a skill that does role planning for downstream agent dispatch.

## Goals

- One-line dev requests trigger automatic role + task planning
- Output: a plan file with role-tagged tasks ready for `subagent-driven-development`
- Low friction: single confirm gate, no per-step approval
- Compose cleanly with existing skill chain — don't reinvent execution/review

## Non-Goals (V1)

- Dynamic role generation beyond a limited "extension slot"
- Parallel task scheduling / DAG analysis
- Replacing `brainstorming` for ambiguous requirements that need design discussion
- Automated regression tests (V1 ships with dogfood examples only)
- Project-specific role pool customization (deferred to V2)

## Rejected Alternatives

| Option | Why rejected |
|--------|--------------|
| **Pure dynamic role generation** | User's own prior observation: LLMs over-decompose and invent flowery role names without grounding |
| **Skill that owns full lifecycle (plan + dispatch + integrate)** | Overlaps with `subagent-driven-development`; doubles maintenance; violates "do one thing" |
| **Planner + DAG scheduling (parallel-aware V1)** | LLM is unreliable at "are these truly independent" judgment; better to ship serial V1, observe pain, then add parallelism |
| **Per-task confirm checkpoint** | Too slow for daily dev; one confirm is the sweet spot |

## Architecture

```
User: one-line dev request
       │
       ▼
[skill triggers via description match]
       │
       ▼
Read request + optionally scan project context (only if role selection needs it, e.g. refactor of unknown module)
       │
       ▼
Analyze: which dev stages does this touch?
       │
       ▼
Select N roles from pool
  ├── standard pool: explorer / architect / implementer / debugger / reviewer / integrator
  └── may add 1 extension role for niche domains
       │
       ▼
Decompose into serial task list, each tagged with role
       │
       ▼
Present plan ──────► AskUserQuestion: Go / Edit roles / Edit tasks / Cancel
       │
       ▼ (on "Go")
Write plan to docs/superpowers/plans/<date>-<topic>.md
       │
       ▼
Invoke subagent-driven-development
```

## Components

### 1. Role Pool

Each role lives in `role-prompts/<role>.md`. The file contains:
- **Responsibilities**: what this role does and doesn't do
- **Tool access**: which Claude Code tools the role can use
- **Output format**: shape of the deliverable
- **When NOT to use**: failure modes to avoid

| Role | Responsibilities | Typical trigger | Tools |
|------|------------------|-----------------|-------|
| **explorer** | Map unfamiliar code; find where things live; answer "where is X implemented" | Entering new repo, reusing existing patterns | Read, Grep, Glob (no write) |
| **architect** | Design new interfaces; write spec; decide module boundaries | New module, large refactor | Read, Write (docs only) |
| **implementer** | Write code; write tests | Almost every requirement | Full toolset |
| **debugger** | Locate bugs; propose fixes | User reports a bug | Read, Bash (diagnostics), Edit |
| **reviewer** | Code quality and spec-compliance review | After implementer finishes | Read (no write) |
| **integrator** | Merge across tasks; resolve conflicts; final acceptance | Multi-implementer output | Full toolset |

### 2. Extension Slot

When the user's request involves a domain not covered by standard roles (e.g., "design a GraphQL schema", "write Prometheus alerting rules", "create an SVG diagram"), the planner may generate **one** ad-hoc role.

Rules:
- Try standard pool combinations first; extension is a last resort
- Extension role inherits implementer's tool access (full toolset); narrower scopes not supported in V1
- Document the ad-hoc role's responsibilities inline in the plan file (not as a permanent file)
- Limit: one extension role per plan; otherwise SKILL.md instructs to ask user for clarification

### 3. Plan Output Format

```markdown
# Plan: <one-line summary of the request>

## Roles in play
- explorer (1 task)
- architect (1 task)
- implementer (3 tasks)
- reviewer (built-in via subagent-driven-development two-stage review)

## Tasks
1. **[explorer]** Map current auth module: identify all files involved in token validation
2. **[architect]** Design OAuth integration interface; output `docs/auth-oauth-design.md`
3. **[implementer]** Implement OAuthProvider class with unit tests
4. **[implementer]** Refactor LoginController to use OAuthProvider
5. **[implementer]** Add E2E test for OAuth login flow
```

### 4. Confirm Flow

After plan generation, call `AskUserQuestion` with four options:

| Option | Action |
|--------|--------|
| Go | Write plan file, invoke `subagent-driven-development` |
| Edit roles | Let user adjust role selection; regenerate task breakdown |
| Edit tasks | Keep roles; let user revise task list |
| Cancel | Exit skill |

## Trigger Conditions (SKILL.md description)

```
Use when user requests a development task that needs role-aware planning—
greenfield features, refactors, multi-file bugs, anything where breaking
down by stage (explore → architect → implement → review → integrate)
adds clarity over a flat task list. Outputs a plan with role tags that
feeds into subagent-driven-development. Do NOT use for single trivial
tasks (typo fix, copy change) or mid-debug targeted help.
```

## File Structure

```
~/.claude/skills/writing-role-aware-plans/
├── SKILL.md                  # Trigger description + flow + role pool reference
├── role-prompts/
│   ├── explorer.md
│   ├── architect.md
│   ├── implementer.md
│   ├── debugger.md
│   ├── reviewer.md
│   └── integrator.md
└── examples/                 # Reference outputs
    ├── add-feature-plan.md
    ├── debug-fix-plan.md
    └── new-module-plan.md
```

## Failure Modes

| Failure | Mitigation |
|---------|------------|
| Wrong role pool selection | User catches at confirm gate |
| Extension role overuse | SKILL.md instructs "standard pool first; limit 1 extension per plan" |
| Downstream execution failure | Handed off to `subagent-driven-development`'s own failure model |
| Skill triggers on too-trivial request | If initial decomposition yields ≤1 substantive task, planner returns: "This looks like a single direct edit, no role planning needed — want me to just do it?" rather than producing a 1-task plan |
| Ambiguous requirements (skill picks wrong angle) | Confirm gate exposes role list; "Edit roles" lets user correct. For truly ambiguous requests, SKILL.md instructs planner to recommend `brainstorming` skill first. |

## V1 Validation (Dogfood Cases)

V1 ships without automated tests. Validation by running three real cases:

1. **Simple feature**: "Add dark mode toggle" → expected: implementer + reviewer, 2-3 tasks
2. **New module**: "Add OAuth login" → expected: explorer + architect + implementer ×N + integrator, 5-6 tasks
3. **Debug scenario**: "Login flakes intermittently" → expected: debugger + implementer + reviewer, 3 tasks

Success criteria:
- Plans look reasonable to a human dev (role selection sensible, tasks well-scoped)
- `subagent-driven-development` consumes the plan without manual rework
- Confirm gate UX feels right — not too chatty, not too magic

## Open Questions / V2+

- DAG scheduling for parallel-eligible tasks (Q: which scheduling primitive — `dispatching-parallel-agents` or new mini-scheduler?)
- Learning loop: track which role combos succeed; refine pool prompts over time
- Project-specific role pool customization (`.claude/roles.yaml`)
- Auto-route to `brainstorming` for genuinely ambiguous inputs (instead of just recommending)
- Integration with `writing-plans` for cases where role-aware plan needs more detailed task breakdown

## Naming Rationale

Chose `writing-role-aware-plans` over alternatives:

- `planning-role-based-tasks` — accurate but doesn't signal "writes a plan file"
- `orchestrating-multi-role-dev` — sounds heavier than it is; suggests full lifecycle ownership
- **`writing-role-aware-plans`** — explicit sibling to `writing-plans`; user immediately knows where it fits in the chain

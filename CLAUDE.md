# Claude Code Policy – Oro Repository

This document defines rules for AI-assisted development in this repository.

## Dependency Safety Policy

### Non-Negotiable Rules

1. **No dependency installs without explicit approval.** The following commands require human approval BEFORE execution:
   - `pnpm add` / `npm install <pkg>` / `yarn add`
   - `pnpm install` (unless it's the first install from an already-committed lockfile)
   - `pip install` / `poetry add`
   - `curl | bash`, `wget | bash`, or any installer script
   - Executing unknown scripts, binaries, or postinstall hooks

2. **Dependency Proposal Required.** Before proposing ANY install, provide a block with:
   - Exact packages and versions (pinned)
   - Why each is needed (1 sentence)
   - Whether it triggers postinstall scripts (and which)
   - Safer alternative using existing deps (if any)
   - Then STOP and wait for approval

3. **Prefer boring, widely-adopted packages.** Avoid niche or low-maintenance dependencies.

### Allowed by Default (No Approval Needed)

- File edits and refactors
- `pnpm dev` / `npm run dev` / `next dev`
- `pnpm lint` / `npm run lint`
- `pnpm typecheck` / `npm run typecheck`
- `pnpm test` / `npm run test`
- `pnpm build` / `npm run build`
- `pnpm audit` / `npm audit`
- Git operations (commit, push, branch, etc.)
- Reading files, grepping, exploring codebase

### Approval Required

- Any `*install*` or `*add*` command that modifies dependencies
- Any script that downloads binaries
- Any postinstall scripts (review before allowing)
- Running unfamiliar shell scripts from the repo
- Executing binaries not part of standard tooling

## Dependency Proposal Template

```
## Dependency Proposal

| Package | Version | Purpose | Postinstall? |
|---------|---------|---------|--------------|
| example | ^1.2.3  | reason  | Yes/No       |

**Alternatives considered:** (existing deps that could work, or "none")

**Awaiting approval before proceeding.**
```

## Security Practices

- Pin dependency versions in package.json
- Run `pnpm audit` regularly (at least weekly)
- Never commit secrets or credentials
- Keep `.env*` files gitignored (except `.env.example`)

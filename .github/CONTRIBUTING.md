# Contributing to nectar-design

Thank you for your interest in contributing! nectar-design is a private React component library. Contributions are handled internally.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Branch Strategy](#branch-strategy)
- [Development Workflow](#development-workflow)
- [Commit Message Format](#commit-message-format)
- [Code Style & Conventions](#code-style--conventions)
- [Component Conventions](#component-conventions)
- [Token Changes](#token-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

Please read and follow our [Code of Conduct](.github/CODE_OF_CONDUCT.md). All contributors are expected to uphold these standards.

---

## Getting Started

1. **Clone** the repository (requires access):

   ```bash
   git clone git@github.com:tknatwork/nectar-design.git
   cd nectar-design
   ```

2. Install dependencies with **pnpm** (the only supported package manager):

   ```bash
   pnpm install
   ```

3. Build the project to verify your setup:

   ```bash
   pnpm build
   ```

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, released code. **Never target PRs here directly.** |
| `dev`  | Active development. **All PRs must target `dev`.** |

### Workflow

1. Create a feature branch off `dev`:

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/my-feature
   ```

2. Make your changes and commit following the [commit message format](#commit-message-format).
3. Push your branch and open a PR targeting `dev`.

> **PRs that target `main` directly will not be reviewed and will be closed.**

---

## Development Workflow

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run tests (353 unit tests)
pnpm test

# Run linting
pnpm lint

# Run type checks
pnpm typecheck

# Launch Storybook
pnpm storybook
```

Always run `pnpm build`, `pnpm test`, and `pnpm lint` before submitting a PR. PRs with lint errors, test failures, or build failures will not be merged.

---

## Commit Message Format

nectar-design follows the **Conventional Commits** specification:

```text
type(scope): description
```

### Types

| Type       | When to use |
|------------|-------------|
| `feat`     | A new feature or component |
| `fix`      | A bug fix |
| `docs`     | Documentation only changes |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests |
| `chore`    | Build process, tooling, or dependency changes |
| `style`    | Formatting changes (no logic change) |
| `perf`     | Performance improvements |

### Scope

Use the component or area name, e.g. `button`, `tokens`, `badge`, `build`, `circadian`, `engine`.

### Examples

```text
feat(button): add loading state variant
fix(badge): correct pill border-radius token
docs(contributing): update branch strategy
refactor(input): extract base styles into cva
test(select): add keyboard navigation tests
```

---

## Code Style & Conventions

- **TypeScript strict mode** is enforced. All new code must be fully typed — no `any`.
- Use **named exports** only. Default exports are not permitted.
- Use **`cva`** (class-variance-authority) for defining component variants.
- Use **`cn()`** for all className merging and conditional class logic.
- Avoid inline style objects unless absolutely necessary.
- Keep component files focused: one component per file.

---

## Component Conventions

### Variants with `cva`

All stylistic variants must be defined using `cva`:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

### `forwardRef` on Form Elements

All form and interactive elements **must** use `React.forwardRef`:

```tsx
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={cn(inputVariants(), className)} {...props} />;
  }
);

Input.displayName = 'Input';
```

### `displayName`

Every component **must** have a `displayName` set for debugging purposes.

---

## Token Changes

Design tokens are the source of truth for all visual decisions (color, spacing, typography, etc.).

- ✅ **Edit the JSON source files** in the `tokens/` directory.
- ❌ **Never edit `tokens.css` directly.** It is auto-generated by the build script.

After editing token JSON files, run:

```bash
pnpm build            # Regenerates tokens.css + validates namespace collisions
pnpm validate:tokens  # Checks reference integrity and spacing scale ordering
```

---

## Submitting a Pull Request

1. Ensure your branch is up to date with `dev`.
2. Run `pnpm build` and `pnpm lint` — both must pass.
3. Open a PR against `dev` using the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
4. Fill out all checklist items in the PR template.
5. Link any related issues using `Closes #<issue-number>`.

A maintainer will review your PR. Please be patient and responsive to feedback.

---

## Reporting Issues

Use the GitHub issue templates:

File issues directly in the private GitHub repository. Please search existing issues before opening a new one.

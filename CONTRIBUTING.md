# Contributing to APIBP-20242YA-Team-3

Thank you for wanting to contribute! This document explains how to get started, the preferred workflows, and how to make contributions that are easy to review and merge.

## Table of Contents
- [Good first contributions](#good-first-contributions)
- [How to report bugs](#how-to-report-bugs)
- [How to propose changes (feature requests / PRs)](#how-to-propose-changes-feature-requests--prs)
- [Branching & PR workflow](#branching--pr-workflow)
- [Code style & tests](#code-style--tests)
- [Commit messages](#commit-messages)
- [Code review process](#code-review-process)
- [Security and reporting vulnerabilities](#security-and-reporting-vulnerabilities)

## Good first contributions
- Fix typos in documentation (README, API docs)
- Improve or add JSDoc comments for endpoints
- Small bug fixes in modules with tests or clear behavior

## How to report bugs
When you find a bug, open a GitHub Issue and include:
- A clear title
- Steps to reproduce
- Expected vs actual behavior
- Environment: Node.js version, OS, any relevant logs
- (Optional) A minimal reproduction repository or code snippet

## How to propose changes (feature requests / PRs)
- Fork the repository (if you don't have push access) or create a new branch in this repo.
- Implement the change on a topic branch.
- Keep changes focused and small.
- Ensure existing behavior is not broken; add tests if appropriate.
- Update or add relevant documentation (JSDoc, README, API docs) as part of the change.

## Branching & PR workflow
1. Make sure `main` is up-to-date:

```bash
git checkout main
git pull origin main
```

2. Create a feature branch:

```bash
git checkout -b <your-username>/<short-feature-name>
```

3. Work, commit, and push your branch:

```bash
git add .
git commit -m "Short, descriptive message"
git push origin <your-username>/<short-feature-name>
```

4. Open a Pull Request targeting `main`. In your PR description, explain:
   - What problem does it solve?
   - How to test the change
   - Any edge cases or limitations

## Code style & tests
- Follow the existing code style (consistent indentation, JS conventions).
- Add or update JSDoc comments for any public endpoints you change.
- If you add functionality, include a minimal test or manual test steps.

## Commit messages
Use short, clear commit messages. Example format:

```
<type>(<scope>): <short summary>

<body> (optional, for larger changes)

Footer: related issues
```

Common types:
- `feat` - new feature
- `fix` - bug fix
- `docs` - documentation only changes
- `chore` - build process or auxiliary tools
- `test` - adding or fixing tests

## Code review process
- Maintain a respectful tone when reviewing.
- Request changes only for clear issues; prefer suggestions when possible.
- Keep PRs focused to make review faster.

## Security and reporting vulnerabilities
If you find a security vulnerability, please email the maintainers directly (see `CODE_OF_CONDUCT.md`) or open a private issue flagged for maintainers.

---

Thanks for contributing — we appreciate your help! If you'd like, I can also:
- Add issue/pr templates
- Add a checklist to the PR template for reviewers
- Add CI (GitHub Actions) skeleton to run linters/tests

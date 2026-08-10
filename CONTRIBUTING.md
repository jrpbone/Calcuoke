# Contributing to Calcuoke

Thank you for helping improve Calcuoke. Contributions may include bug fixes, interface improvements, accessibility work, documentation, database changes, or carefully scoped new features.

## Before you start

1. Check existing issues and pull requests to avoid duplicating work.
2. Open an issue before starting a large feature, schema change, or workflow redesign.
3. Keep each contribution focused on one problem or closely related set of changes.
4. Never commit customer records, credentials, browser storage exports, or other sensitive data.

## Development setup

### Client-only simulation mode

```bash
git clone https://github.com/jrpbone/Calcuoke.git
cd Calcuoke
npm install
npm run client
```

The client automatically uses `localStorage` when the API is unavailable. This is sufficient for most UI work.

### Full-stack mode

1. Create a local MySQL database using `database/schema.sql`.
2. Set any required `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, or `PORT` environment variables.
3. Start the client and API together:

```bash
npm run dev
```

The schema file drops and recreates application tables. Do not run it against a database containing records you need to preserve.

## Recommended workflow

1. Fork the repository and create a branch from `main`.
2. Use a short, descriptive branch name such as `feat/mobile-inventory` or `fix/warranty-date`.
3. Make the smallest complete change that solves the problem.
4. Verify both light and dark themes and check desktop and mobile layouts for UI changes.
5. Run the production quality gate:

```bash
npm run build
```

6. Review your diff for secrets, generated files, unrelated formatting, and accidental data changes.
7. Push your branch and open a pull request.

## Coding guidelines

### TypeScript and React

- Keep strict TypeScript checks passing; avoid `any` unless an external browser API genuinely requires it.
- Reuse the domain models in `data/types.ts` instead of defining competing versions.
- Keep page components focused on orchestration and move reusable interface pieces into `components/`.
- Prefer derived state with `useMemo` over duplicated state that can become inconsistent.
- Preserve API and simulation-mode behavior when changing data operations.

### Interface and accessibility

- Use the shared theme variables and existing semantic colors rather than introducing isolated hex values.
- Verify readable contrast in both light and dark themes.
- Include visible focus states and useful accessible names for icon-only controls.
- Support keyboard interaction and do not rely on color alone to communicate status.
- Test at mobile, tablet, and desktop widths.
- Keep destructive actions clearly labeled and confirmed.

### Data and backend changes

- Validate and normalize request data at the API boundary.
- Use parameterized SQL statements for dynamic values.
- Keep project components, original components, photos, and swap history transactionally consistent.
- Explain schema changes in the pull request and provide a safe migration path when existing data would be affected.
- Update client types, API mapping, and documentation together when changing a shared data shape.

## Commit messages

Clear commit messages make changes easier to review. Conventional Commit-style prefixes are encouraged:

```text
feat: add inventory quantity indicator
fix: preserve original component after swap
docs: clarify MySQL setup
refactor: extract shared modal header
```

Use the imperative mood and describe why the change matters when the implementation is not self-explanatory.

## Pull request checklist

Before requesting review, confirm that:

- [ ] The change has a clear purpose and limited scope.
- [ ] `npm run build` completes successfully.
- [ ] Existing assembly, sale, warranty, and replacement workflows still work.
- [ ] UI changes were checked in light and dark modes.
- [ ] UI changes were checked at mobile and desktop widths.
- [ ] New controls have labels, focus states, and appropriate keyboard behavior.
- [ ] Database changes include impact and migration notes.
- [ ] Documentation was updated when behavior or setup changed.
- [ ] No credentials, customer data, `node_modules`, or `dist` files are included.

## Reporting bugs

A useful bug report includes:

- A short description of the expected and actual behavior.
- Exact reproduction steps.
- Whether the app was in **Online** or **Local mode**.
- Browser, operating system, and relevant Node/MySQL versions.
- Screenshots or console output with sensitive information removed.

## Suggesting features

Describe the workflow problem first, then the proposed solution. Include the affected user role, expected outcome, data implications, and any warranty or inventory rules involved.

## License

By contributing, you agree that your contribution will be distributed under the repository's [GNU General Public License v3.0](LICENSE).

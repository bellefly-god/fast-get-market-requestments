# Project Rules

## 1. Runtime & Package Manager
- Use `npm` as the default package manager.
- Keep `package.json` and `package-lock.json` in sync.
- Recommended Node.js version: `>=20`.

## 2. Local Development
- Install dependencies with `npm install`.
- Start local dev with `npm run dev`.
- Before submitting changes, run:
  - `npm run build`
  - `npm test`

## 3. Code Quality
- Do not commit code that fails build or tests.
- Keep changes focused; avoid unrelated refactors in the same PR/commit.
- Prefer TypeScript-safe changes and avoid `any` unless justified.

## 4. UI & Styling
- Reuse existing UI components under `src/components/ui` first.
- Keep design tokens and global styles centralized in `src/index.css`.
- Do not introduce one-off inline styles when utility classes or shared styles fit.

## 5. Routing & Pages
- Add or modify pages under `src/pages`.
- Keep unknown routes handled by `src/pages/NotFound.tsx`.

## 6. Data & Mocks
- Keep sample/mock data in `src/data`.
- If mock schema changes, update all consumers in the same change.

## 7. Testing
- Place tests under `src/test` or next to related modules when appropriate.
- New features should include at least one meaningful test path.

## 8. Git Hygiene
- Keep commits atomic and descriptive.
- Never commit secrets or environment credentials.

## 9. Documentation
- Update `README.md` when startup steps, commands, or architecture assumptions change.

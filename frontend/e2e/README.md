# E2E Regression Suite

This suite targets the existing local services by default:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

## Covered flows

- Password login for a first-time user
- Workspace creation
- Issue creation from the main composer
- Issue detail navigation
- Issue property edits from the right sidebar
- Inline sub-issue creation
- Activity timeline verification
- Comment creation

## Commands

```bash
npm run test:e2e
npm run test:e2e:headed
```

## Optional environment overrides

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000
PLAYWRIGHT_API_BASE_URL=http://localhost:8080/api
```

# E2E Regression Suite

This suite targets the local development environment by default:

- Frontend: `http://localhost:3001` through the Playwright-managed dev server
- Backend API: `http://localhost:8080/api`
- Browser coverage: Chromium only

## Markdown editor regression matrix

- `markdown-editor.rendering.spec.ts`
  - Persisted Markdown rendering
  - Empty / long / mixed content
  - Render -> edit -> save -> reload round-trip
- `markdown-editor.toolbar.spec.ts`
  - Floating toolbar visibility
  - Bold / italic / strike / heading / list / quote / code / divider
  - Link popover create / edit / remove
- `markdown-editor.input-rules.spec.ts`
  - `#`, `##`, `-`, `1.`, `[ ]`, `>`, `---`, fenced code block
  - Structured Markdown paste
- `markdown-editor.slash-menu.spec.ts`
  - Slash menu open / filter / keyboard navigation / escape
  - Paragraph / heading / list / task / quote / code / divider commands
- `markdown-editor.integrations.spec.ts`
  - Slash bridges for attachment, sub-issue, related issue, document relation, project relation
- `markdown-editor.stability.spec.ts`
  - Forward / backward / programmatic selection
  - Rapid typing
  - Idle save / blur save
  - Save failure recovery

## Soft performance metrics

The Markdown editor suite records soft thresholds for:

- toolbar appearance
- slash menu appearance
- link popover appearance
- idle autosave completion
- blur save completion
- attachment bridge upload

Threshold breaches are logged as warnings and test annotations. They do not fail the suite by themselves.

## Commands

```bash
npm run test:e2e
npm run test:e2e:headed
npx playwright test markdown-editor*.spec.ts --reporter=line --workers=1
```

## Optional environment overrides

```bash
PLAYWRIGHT_PORT=3001
PLAYWRIGHT_BASE_URL=http://localhost:3001
PLAYWRIGHT_API_BASE_URL=http://localhost:8080/api
```

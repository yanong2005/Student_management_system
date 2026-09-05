# UI Architecture

The current product uses browser-native ES modules and pure HTML render functions. This keeps deployment simple while giving the interface explicit component boundaries that can migrate to Vue or React later.

## Component layers

```text
features/workspace/page.js
  page orchestration, routing, event binding
features/workspace/views.js
  feature views and domain-specific composition
shared/ui.js
  reusable presentational components
shared/html.js
  escaping and display helpers
shared/grade.js
  shared domain rules
```

## Component API

Components are pure functions. They accept a props object and return an HTML string.

```js
StatCard({ label, value, note, tone })
Panel({ title, eyebrow, action, content, className })
EmptyState({ title, message })
LoadingState({ message })
ErrorState({ message, action, actionId })
DataTable({ headers, rows, empty, label })
Button({ label, icon, variant, type, ...attributes })
```

Values rendered as text are escaped by the component layer. Event behavior belongs to the feature page and is attached after rendering using stable `data-*` attributes.

## Usage example

```js
import { Panel, StatCard } from "../../shared/ui.js";

const content = StatCard({
    label: "Passing rate",
    value: "92%",
    note: "Across recorded grades",
    tone: "green"
});

const markup = Panel({
    eyebrow: "ACADEMIC HEALTH",
    title: "Performance",
    content
});
```

## Production practices

- Always provide a loading, empty, and failure state for remote data.
- Use semantic elements, button types, table scopes, labels, and live regions.
- Keep domain rules in shared modules, not inside templates.
- Escape user-controlled values before inserting HTML.
- Use stable `data-*` hooks for behavior and keep styling classes presentational.
- Test keyboard navigation, narrow viewports, slow API responses, empty collections, and rejected saves.
- Prefer progressive enhancement: the page remains readable while remote data is hydrating.
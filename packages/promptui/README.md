# PromptUI

Components designed for humans, agents, and automation.

PromptUI is a framework-agnostic TypeScript library for defining UI as both a human-facing interface and a machine-readable contract. Components carry semantics, actions, validation rules, and introspection metadata without depending on React or a vendor SDK.

## Install

```bash
npm install promptui
```

## Quick Start

```ts
import { action, createPromptUI, field, form } from "promptui";

const ui = createPromptUI({
  id: "lead-qualification",
  title: "Lead Qualification"
});

ui.add(
  form({
    id: "contact-form",
    title: "Get in touch",
    fields: [
      field.text({ id: "fullName", label: "Full name", required: true }),
      field.email({ id: "email", label: "Email", required: true })
    ],
    actions: [
      action.submit({
        id: "submit-lead",
        label: "Submit",
        intent: "create_lead"
      })
    ]
  })
);

ui.onAction("submit-lead", async (payload) => {
  return { stored: payload.values };
});

const snapshot = ui.serialize();
const inspect = ui.inspect();
const result = await ui.dispatch("submit-lead", {
  values: {
    fullName: "Mario Moreno",
    email: "mario@example.com"
  }
});
```

## Core Concepts

- Definition layer: `form`, `field`, `card`, `section`, `table`, `panel`, and `action` builders create semantic component contracts.
- Serialization layer: `ui.serialize()` returns a stable JSON document suitable for agents, auditing, and automation.
- Execution layer: `ui.onAction()` and `ui.dispatch()` validate payloads and run structured handlers.
- Introspection layer: `ui.inspect()`, `ui.getActions()`, `ui.getComponentById()`, and `ui.getSchema()` expose machine-readable metadata.
- Rendering layer: `renderToHTML()` and `createRenderTree()` provide lightweight human-facing output helpers without tying the core to a framework.

## Notes

- PromptUI does not execute LLMs or plan agent behavior.
- Rendering is intentionally lightweight in v1.
- Serialization quality depends on the semantics you provide when defining components.


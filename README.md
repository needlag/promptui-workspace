# PromptUI

Components designed for humans, agents, and automation.

PromptUI is an AI-native UI component system for modern web apps. It treats UI definitions as both human interfaces and machine-operable contracts, so the same component tree can render for people, serialize for agents, validate structured payloads, and dispatch semantic actions.

## Why PromptUI exists

Most UI systems stop at presentation. Most form libraries stop at validation. Most automation layers operate on brittle selectors or ad hoc JSON. PromptUI sits between those concerns.

It gives developers a single definition layer for:

- human-facing rendering
- machine-readable metadata
- structured actions and intents
- normalized validation rules
- UI serialization and introspection

The result is a practical UI contract that can be inspected and operated by software without abandoning usability for humans.

## What is in this repo

- `packages/promptui`: framework-agnostic TypeScript core library
- `apps/demo`: Vite + React demo that renders the same definitions and shows their serialized agent view
- unit tests for serialization, dispatch, validation, lookup, and schema generation

## Features

- Framework-neutral component model
- Declarative builders for `section`, `form`, `field`, `card`, `table`, `panel`, and `action`
- Stable JSON serialization with semantic metadata
- First-class structured actions with ids, intents, labels, schemas, and confirmation metadata
- JSON Schema generation for forms and action payloads
- Structured validation results for humans and software
- Introspection APIs for components, actions, and schemas
- Lightweight rendering helpers plus a polished demo implementation
- Accessibility-conscious HTML structure in the rendering layer
- Optional state adapters for local binding

## Quick Start

```bash
npm install
npm run build
npm run test
npm run dev
```

If you prefer pnpm, the workspace is also configured with `pnpm-workspace.yaml`.

## Install the library

```bash
npm install promptui-workspace
```

## Core API

```ts
import { action, createPromptUI, field, form } from "promptui";

const ui = createPromptUI({
  id: "lead-qualification",
  title: "Lead Qualification",
  description: "Capture inquiry details and next-step eligibility",
});

ui.add(
  form({
    id: "contact-form",
    title: "Get in touch",
    description: "Collect lead details for qualification",
    fields: [
      field.text({
        id: "fullName",
        label: "Full name",
        required: true,
      }),
      field.email({
        id: "email",
        label: "Email",
        required: true,
      }),
      field.select({
        id: "inquiryType",
        label: "Inquiry type",
        required: true,
        options: [
          { value: "sales", label: "Sales" },
          { value: "partnership", label: "Partnership" },
          { value: "support", label: "Support" },
        ],
      }),
      field.textarea({
        id: "message",
        label: "Message",
      }),
    ],
    actions: [
      action.submit({
        id: "submit-lead",
        label: "Submit",
        intent: "create_lead",
      }),
    ],
  }),
);
```

## Form dispatch example

```ts
ui.onAction("submit-lead", async (payload, ctx) => {
  console.log("intent", ctx.action.intent);
  console.log("values", payload.values);

  return {
    accepted: true,
    queue: "sales-intake",
  };
});

const result = await ui.dispatch("submit-lead", {
  values: {
    fullName: "Mario Moreno",
    email: "mario@example.com",
    inquiryType: "sales",
    message: "I want more information",
  },
});
```

## Serialization example

```ts
const snapshot = ui.serialize();
const tree = ui.inspect();

console.log(snapshot.components);
console.log(tree.actions);
console.log(tree.schemas);
```

Conceptually, the serialized output looks like:

```json
{
  "kind": "promptui",
  "id": "lead-qualification",
  "title": "Lead Qualification",
  "components": [
    {
      "id": "contact-form",
      "type": "form",
      "title": "Get in touch",
      "fields": [
        {
          "id": "fullName",
          "type": "text",
          "label": "Full name",
          "required": true
        }
      ],
      "actions": [
        {
          "id": "submit-lead",
          "kind": "submit",
          "intent": "create_lead",
          "label": "Submit"
        }
      ]
    }
  ]
}
```

## Introspection APIs

- `ui.serialize()`: stable machine-readable document
- `ui.inspect()`: serialized root plus flat component and action indexes
- `ui.getActions()`: normalized action registry
- `ui.getComponentById(id)`: retrieve a component definition
- `ui.getSchema()`: form schemas and action payload schemas
- `ui.dispatch(actionId, payload)`: validate and execute an action
- `ui.onAction(actionId, handler)`: register a structured handler

## Demo

The demo app shows both the rendered UI and the machine-facing view for three scenarios:

1. Lead Qualification Form
2. Invoice Approval Review Card
3. Support Operations Action Panel

Run it locally:

```bash
npm install
npm run dev
```

## Architecture Summary

PromptUI is built in four practical layers:

1. Definition layer
   Components are declared with small builder functions and explicit semantic metadata.
2. Serialization layer
   Definitions normalize into stable JSON with actions, validation rules, and component metadata.
3. Execution layer
   Actions are registered and dispatched through a typed runtime that validates payloads and returns structured results.
4. Rendering layer
   Lightweight helpers and the demo prove that the same contract can drive a usable interface for humans.

## Why not just use a component library?

Component libraries solve presentation and interaction primitives. PromptUI adds:

- structured semantics
- machine-readable actions
- introspection
- normalized validation metadata
- a bridge between UI and automation

## Why not just expose raw JSON?

Raw JSON is not enough on its own. PromptUI adds:

- typed developer ergonomics
- usable human rendering
- reusable component contracts
- an action dispatch model
- consistent semantics and validation behavior

## Limitations

- PromptUI does not include LLM execution.
- PromptUI does not replace a full frontend framework.
- PromptUI does not solve autonomous agent planning by itself.
- Rendering is intentionally lightweight in v1.
- Serialization quality depends on the developer’s component definitions.

## Roadmap

- richer list and table affordances
- deeper accessibility metadata and keyboard policies
- richer framework adapters beyond the demo
- schema export helpers for external automation pipelines
- workflow composition primitives above the current action model

import type {
  ActionDispatchResult,
  ActionHandler,
  PromptUIComponentDefinition,
  PromptUIInspection,
  PromptUIInstance
} from "../types/public";
import type { PromptUIDocumentDefinition } from "../types/internal";
import { createRegistry } from "./registry";
import { validateFormValues, validateSchema } from "../validation/validate";

export class PromptUIActionNotFoundError extends Error {
  constructor(actionId: string) {
    super(`PromptUI could not find an action with id "${actionId}".`);
    this.name = "PromptUIActionNotFoundError";
  }
}

interface DispatchConfig {
  document: PromptUIDocumentDefinition;
  handlers: Map<string, ActionHandler>;
  actionId: string;
  payload: Record<string, unknown>;
  ui: PromptUIInstance;
  inspect: () => PromptUIInspection;
}

function maybeValidateFormPayload(
  component: PromptUIComponentDefinition | undefined,
  payload: Record<string, unknown>
) {
  if (!component || component.type !== "form") {
    return [];
  }

  const values = payload.values;
  if (typeof values !== "object" || values === null || Array.isArray(values)) {
    return [
      {
        path: "$.values",
        message: "Form actions require a values object.",
        rule: "type"
      }
    ];
  }

  return validateFormValues(component, values as Record<string, unknown>).issues;
}

export async function dispatchAction<T = unknown>({
  document,
  handlers,
  actionId,
  payload,
  ui,
  inspect
}: DispatchConfig): Promise<ActionDispatchResult<T>> {
  const registry = createRegistry(document);
  const entry = registry.actions.get(actionId);

  if (!entry) {
    throw new PromptUIActionNotFoundError(actionId);
  }

  const { action, component } = entry;

  if (action.disabled) {
    return {
      ok: false,
      status: "disabled",
      actionId
    };
  }

  const issues = [
    ...validateSchema(payload, action.inputSchema ?? { type: "object", additionalProperties: true }),
    ...maybeValidateFormPayload(component, payload)
  ];

  if (issues.length > 0) {
    return {
      ok: false,
      status: "validation_error",
      actionId,
      issues
    };
  }

  const handler = handlers.get(actionId);
  if (!handler) {
    return {
      ok: false,
      status: "unhandled",
      actionId
    };
  }

  try {
    const data = await handler(payload, {
      action,
      component,
      ui,
      inspect,
      timestamp: new Date().toISOString()
    });

    return {
      ok: true,
      status: "success",
      actionId,
      data: data as T
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      actionId,
      error: {
        message: error instanceof Error ? error.message : "Action handler failed."
      }
    };
  }
}


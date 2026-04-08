import type {
  ActionHandler,
  PromptUIComponentDefinition,
  PromptUIInstance,
  RootDefinition,
  StateAdapter
} from "../types/public";
import type { PromptUIDocumentDefinition } from "../types/internal";
import { normalizeComponent, normalizeRoot } from "../utils/normalize";
import { inspectDocument } from "./inspect";
import { serializeDocument } from "./serialize";
import { dispatchAction } from "./dispatch";

export function createPromptUI(config: RootDefinition): PromptUIInstance {
  const root = normalizeRoot(config);
  const components = [...root.components];
  const handlers = new Map<string, ActionHandler>();
  const stateAdapters = new Map<string, StateAdapter<unknown>>();

  function getDocument(): PromptUIDocumentDefinition {
    return {
      ...root,
      components
    };
  }

  const api: PromptUIInstance = {
    add(...nextComponents: PromptUIComponentDefinition[]) {
      components.push(...nextComponents.map(normalizeComponent));
      return api;
    },
    inspect() {
      return inspectDocument(getDocument());
    },
    serialize() {
      return serializeDocument(getDocument());
    },
    getActions() {
      return api.inspect().actions;
    },
    getComponentById(id) {
      return api.inspect().components.find((item) => item.id === id)
        ? findComponent(getDocument().components, id)
        : undefined;
    },
    getSchema() {
      return api.inspect().schemas;
    },
    onAction(actionId, handler) {
      handlers.set(actionId, handler);
      return api;
    },
    offAction(actionId) {
      handlers.delete(actionId);
      return api;
    },
    async dispatch<T = unknown>(actionId: string, payload: Record<string, unknown> = {}) {
      return dispatchAction({
        document: getDocument(),
        handlers,
        actionId,
        payload,
        ui: api,
        inspect: api.inspect
      });
    },
    bindState<T>(componentId: string, adapter: StateAdapter<T>) {
      stateAdapters.set(componentId, adapter as StateAdapter<unknown>);
      return api;
    },
    getStateAdapter<T>(componentId: string) {
      return stateAdapters.get(componentId) as StateAdapter<T> | undefined;
    }
  };

  return api;
}

function findComponent(
  components: PromptUIComponentDefinition[],
  id: string
): PromptUIComponentDefinition | undefined {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }

    if ("children" in component && Array.isArray(component.children)) {
      const nested = findComponent(component.children, id);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

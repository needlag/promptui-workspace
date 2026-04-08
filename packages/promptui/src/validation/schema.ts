import type {
  FormDefinition,
  JSONSchemaDefinition,
  PromptUIComponentDefinition,
  PromptUISchemaBundle
} from "../types/public";
import type { PromptUIDocumentDefinition } from "../types/internal";
import { isForm } from "../utils/guards";
import { fieldToSchema } from "./fieldRules";

export function createFormValueSchema(form: FormDefinition): JSONSchemaDefinition {
  const properties = Object.fromEntries(form.fields.map((field) => [field.id, fieldToSchema(field)]));
  const required = form.fields.filter((field) => field.required).map((field) => field.id);

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: `form:${form.id}`,
    title: form.title ?? form.id,
    description: form.description,
    type: "object",
    properties,
    required,
    additionalProperties: false
  };
}

export function createActionPayloadSchema(
  component: PromptUIComponentDefinition | undefined,
  actionSchema?: JSONSchemaDefinition
): JSONSchemaDefinition {
  if (actionSchema) {
    return actionSchema;
  }

  if (component && isForm(component)) {
    return {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        values: createFormValueSchema(component)
      },
      required: ["values"],
      additionalProperties: false
    };
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    additionalProperties: true
  };
}

function collectForms(
  components: PromptUIComponentDefinition[],
  output: Record<string, JSONSchemaDefinition>
): void {
  for (const component of components) {
    if (component.type === "form") {
      output[component.id] = createFormValueSchema(component);
    }

    if ("children" in component && Array.isArray(component.children)) {
      collectForms(component.children, output);
    }
  }
}

export function createSchemaBundle(document: PromptUIDocumentDefinition): PromptUISchemaBundle {
  const forms: Record<string, JSONSchemaDefinition> = {};
  collectForms(document.components, forms);

  return {
    document: {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      $id: `promptui:${document.id}`,
      title: document.title,
      description: document.description,
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        components: {
          type: "array",
          items: {
            type: "object"
          }
        }
      },
      required: ["id", "title", "components"],
      additionalProperties: false
    },
    forms,
    actions: {}
  };
}


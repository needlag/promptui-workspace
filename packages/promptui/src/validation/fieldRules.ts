import type { JSONSchemaDefinition, PromptUIFieldDefinition } from "../types/public";

export function fieldToSchema(field: PromptUIFieldDefinition): JSONSchemaDefinition {
  const base: JSONSchemaDefinition = {
    type: "string",
    title: field.label,
    description: field.description,
    minLength: field.required ? Math.max(1, field.minLength ?? 1) : field.minLength,
    maxLength: field.maxLength,
    default: field.defaultValue
  };

  if (field.type === "email") {
    base.format = "email";
  }

  if (field.type === "select") {
    base.enum = field.options.map((option) => option.value);
  }

  return base;
}


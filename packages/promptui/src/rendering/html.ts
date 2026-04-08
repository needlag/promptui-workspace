import type {
  SerializedActionDefinition,
  SerializedComponentDefinition,
  SerializedFieldDefinition,
  SerializedPromptUIDocument
} from "../types/public";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderActions(actions: SerializedActionDefinition[]): string {
  if (actions.length === 0) {
    return "";
  }

  const buttons = actions
    .map(
      (action) =>
        `<button type="button" data-promptui-action="${escapeHtml(action.id)}">${escapeHtml(
          action.label
        )}</button>`
    )
    .join("");

  return `<div class="pui-actions">${buttons}</div>`;
}

function renderField(field: SerializedFieldDefinition): string {
  const required = field.required ? " required" : "";
  const describedBy = field.description
    ? ` aria-description="${escapeHtml(field.description)}"`
    : "";

  if (field.type === "textarea") {
    return `<label><span>${escapeHtml(field.label)}</span><textarea name="${escapeHtml(
      field.id
    )}"${required}${describedBy}></textarea></label>`;
  }

  if (field.type === "select") {
    const options = field.options
      .map(
        (option) =>
          `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`
      )
      .join("");

    return `<label><span>${escapeHtml(field.label)}</span><select name="${escapeHtml(
      field.id
    )}"${required}${describedBy}>${options}</select></label>`;
  }

  return `<label><span>${escapeHtml(field.label)}</span><input type="${escapeHtml(
    field.type
  )}" name="${escapeHtml(field.id)}"${required}${describedBy} /></label>`;
}

function renderComponent(component: SerializedComponentDefinition): string {
  if (component.type === "section") {
    return `<section data-promptui-id="${escapeHtml(component.id)}"><header><h2>${escapeHtml(
      component.title ?? component.id
    )}</h2><p>${escapeHtml(component.description ?? "")}</p></header>${component.children
      .map(renderComponent)
      .join("")}${renderActions(component.actions)}</section>`;
  }

  if (component.type === "form") {
    return `<form data-promptui-id="${escapeHtml(component.id)}"><header><h3>${escapeHtml(
      component.title ?? component.id
    )}</h3><p>${escapeHtml(component.description ?? "")}</p></header><div class="pui-fields">${component.fields
      .map(renderField)
      .join("")}</div>${renderActions(component.actions)}</form>`;
  }

  if (component.type === "card") {
    const attributes = component.attributes
      .map(
        (attribute) =>
          `<div><dt>${escapeHtml(attribute.label)}</dt><dd>${escapeHtml(String(attribute.value))}</dd></div>`
      )
      .join("");

    return `<article data-promptui-id="${escapeHtml(component.id)}"><header><h3>${escapeHtml(
      component.title ?? component.id
    )}</h3><p>${escapeHtml(component.description ?? "")}</p></header><dl>${attributes}</dl>${component.children
      ?.map(renderComponent)
      .join("")}${renderActions(component.actions)}</article>`;
  }

  if (component.type === "table") {
    const head = component.columns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join("");
    const rows = component.rows
      .map(
        (row) =>
          `<tr>${component.columns
            .map((column) => `<td>${escapeHtml(String(row[column.id] ?? ""))}</td>`)
            .join("")}</tr>`
      )
      .join("");

    return `<section data-promptui-id="${escapeHtml(component.id)}"><header><h3>${escapeHtml(
      component.title ?? component.id
    )}</h3><p>${escapeHtml(component.description ?? "")}</p></header><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>${renderActions(
      component.actions
    )}</section>`;
  }

  return `<aside data-promptui-id="${escapeHtml(component.id)}"><header><h3>${escapeHtml(
    component.title ?? component.id
  )}</h3><p>${escapeHtml(component.description ?? component.body ?? "")}</p></header>${component.children
    ?.map(renderComponent)
    .join("")}${renderActions(component.actions)}</aside>`;
}

export function renderToHTML(document: SerializedPromptUIDocument): string {
  return `<div data-promptui-root="${escapeHtml(document.id)}">${document.components
    .map(renderComponent)
    .join("")}</div>`;
}

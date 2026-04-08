import { action, card, createPromptUI, dialog, field, form, panel } from "promptui";

export function createSupportPanelUI() {
  const ui = createPromptUI({
    id: "support-operations",
    title: "Support Operations Panel",
    description: "Route a live case, annotate the outcome, and expose operations actions to agents.",
    purpose: "support_triage",
    tags: ["support", "ops", "case-management"]
  });

  ui.add(
    dialog({
      id: "support-panel",
      title: "Case 33841",
      description: "Route the case and choose an operations outcome.",
      body: "PromptUI keeps the surface readable for humans while exposing structured intents.",
      actions: [
        action.secondary({
          id: "close-case",
          label: "Close case",
          intent: "close_case",
          description: "Close the case without additional routing."
        }),
        action.destructive({
          id: "escalate-case",
          label: "Escalate",
          intent: "escalate_case",
          description: "Escalate this case to the incident response team."
        })
      ],
      children: [
        card({
          id: "support-summary",
          title: "Case summary",
          description: "Operational context available to both the UI and inspecting agents.",
          attributes: [
            { id: "customer", label: "Customer", value: "Vantage Studio" },
            { id: "tier", label: "Tier", value: "Enterprise" },
            { id: "sla", label: "SLA", value: "1 hour", emphasis: true },
            { id: "status", label: "Status", value: "Awaiting owner" }
          ]
        }),
        form({
          id: "routing-form",
          title: "Routing",
          description: "Assign the ticket and capture a short operator note.",
          fields: [
            field.select({
              id: "ownerTeam",
              label: "Owner team",
              required: true,
              options: [
                { value: "platform", label: "Platform" },
                { value: "billing", label: "Billing" },
                { value: "security", label: "Security" }
              ]
            }),
            field.textarea({
              id: "note",
              label: "Operator note",
              required: true,
              minLength: 10,
              rows: 4
            })
          ],
          actions: [
            action.submit({
              id: "assign-ticket",
              label: "Assign ticket",
              intent: "assign_ticket",
              description: "Assign the ticket and persist the operator note."
            })
          ]
        })
      ]
    }),
    panel({
      id: "support-follow-up",
      title: "Follow-up policy",
      description: "Low-friction surfaces can still publish semantic contracts.",
      body: "Panels can carry actions, body copy, or nested components."
    })
  );

  ui.onAction("assign-ticket", async (payload) => ({
    assigned: true,
    assignment: payload.values
  }));
  ui.onAction("close-case", async () => ({
    closed: true
  }));
  ui.onAction("escalate-case", async () => ({
    escalated: true,
    destination: "incident-response"
  }));

  return ui;
}


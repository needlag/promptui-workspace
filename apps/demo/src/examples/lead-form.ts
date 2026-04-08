import { action, createPromptUI, field, form, section } from "promptui";

export function createLeadQualificationUI() {
  const ui = createPromptUI({
    id: "lead-qualification",
    title: "Lead Qualification",
    description: "Capture inquiry details and expose a structured lead-creation contract.",
    purpose: "qualify_inbound_leads",
    tags: ["sales", "intake", "automation"]
  });

  ui.add(
    section({
      id: "lead-qualification-section",
      title: "Lead intake",
      description: "A human-complete form and a machine-complete action contract share the same source.",
      children: [
        form({
          id: "contact-form",
          title: "Get in touch",
          description: "Collect lead details for routing and qualification.",
          purpose: "collect_contact_details",
          fields: [
            field.text({
              id: "fullName",
              label: "Full name",
              required: true,
              minLength: 2
            }),
            field.email({
              id: "email",
              label: "Email",
              required: true
            }),
            field.select({
              id: "inquiryType",
              label: "Inquiry type",
              required: true,
              options: [
                { value: "sales", label: "Sales" },
                { value: "partnership", label: "Partnership" },
                { value: "support", label: "Support" }
              ]
            }),
            field.textarea({
              id: "message",
              label: "Message",
              minLength: 12,
              validate: (value) =>
                String(value).toLowerCase().includes("http")
                  ? "Include context, not links, in the first message."
                  : null
            })
          ],
          actions: [
            action.submit({
              id: "submit-lead",
              label: "Create lead",
              intent: "create_lead",
              description: "Create a lead record from the current form payload."
            })
          ]
        })
      ]
    })
  );

  ui.onAction("submit-lead", async (payload) => ({
    accepted: true,
    queue: "sales-intake",
    values: payload.values
  }));

  return ui;
}


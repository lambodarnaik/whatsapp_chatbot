export async function handleIncoming(body, sendFn) {
  // parse messages (safe navigation)
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0]?.value;
  const message = changes?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const text = message.text?.body?.trim()?.toLowerCase();
  const button = message.button?.text; // if interactive button used
  const replyId = message.button?.payload || message.button?.id;

  // Example greeting to send interactive buttons
  if (text === "hi" || text === "hello") {
    const payload = {
      messaging_product: "whatsapp",
      to: from,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: "👋 Welcome to *My Business*! Choose an option:" },
        action: {
          buttons: [
            { type: "reply", reply: { id: "services_btn", title: "Services" } },
            { type: "reply", reply: { id: "pricing_btn", title: "Pricing" } },
            { type: "reply", reply: { id: "contact_btn", title: "Contact" } }
          ]
        }
      }
    };
    await sendFn(payload);
    return;
  }

  // handle button replies (these come in message.button.text or message.interactive)
  const selected = button || text;
  switch (selected) {
    case "services":
    case "services_btn":
    case "services_btn".toLowerCase():
      await sendText(from, "📦 Our services: Web Dev, AI chatbots, Automation", sendFn);
      break;
    case "pricing":
      await sendText(from, "💰 Pricing depends on scope. Share your project brief!", sendFn);
      break;
    case "contact":
      await sendText(from, "📞 +91 9876543210\n📧 hi@mybusiness.com", sendFn);
      break;
    default:
      await sendText(from, "Sorry, I didn't get that. Type 'hi' to see menu.", sendFn);
  }
}

async function sendText(to, text, sendFn) {
  const payload = { messaging_product: "whatsapp", to, text: { body: text } };
  return sendFn(payload);
}

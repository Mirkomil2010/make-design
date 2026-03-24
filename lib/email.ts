type WelcomeEmailPayload = {
  to: string;
  username: string;
  name?: string;
};

export async function sendWelcomeEmail(payload: WelcomeEmailPayload) {
  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (!resendApiKey) {
    return {
      sent: false,
      reason:
        "Akkaunt yaratildi, lekin welcome email yuborilmadi. RESEND_API_KEY o'rnatilmagan.",
    };
  }

  const titleName = payload.name?.trim() || payload.username;
  const subject = "Welcome to Vibe Coding";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
      <h2>Welcome, ${titleName}!</h2>
      <p>Your Vibe Coding account is ready.</p>
      <p><b>Username:</b> ${payload.username}</p>
      <p>You can now sign in and submit design systems.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [payload.to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    // Keep provider details in server logs, but return a user-safe reason.
    console.error("Resend email request failed", {
      status: response.status,
      body: errorText,
    });

    if (response.status === 401 || response.status === 403) {
      return {
        sent: false,
        reason:
          "Akkaunt yaratildi, lekin welcome email yuborilmadi. RESEND_API_KEY noto'g'ri.",
      };
    }

    if (response.status === 422) {
      return {
        sent: false,
        reason:
          "Akkaunt yaratildi, lekin welcome email yuborilmadi. RESEND_FROM_EMAIL tasdiqlangan bo'lishi kerak.",
      };
    }

    return {
      sent: false,
      reason:
        "Akkaunt yaratildi, lekin welcome email yuborilmadi. Email servisini tekshiring.",
    };
  }

  return { sent: true };
}

import { NextRequest, NextResponse } from "next/server";
import { getConvexHttpClient } from "@/lib/convex-server";
import { userRefs } from "@/lib/convex-refs";
import { hashPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/email";
import {
  isValidUsername,
  makeUsernameFromEmail,
  normalizeUsername,
} from "@/lib/username";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function describeError(error: unknown) {
  if (error instanceof Error) {
    const ownProps = Object.getOwnPropertyNames(error).reduce<
      Record<string, unknown>
    >((acc, key) => {
      acc[key] = (error as unknown as Record<string, unknown>)[key];
      return acc;
    }, {});
    const serializedProps = JSON.stringify(ownProps);
    const fallbackDetails =
      serializedProps && serializedProps !== "{}"
        ? serializedProps
        : "No additional error details";
    return {
      message: error.message || "Unknown error",
      details:
        error.stack ||
        error.message ||
        fallbackDetails ||
        "Unknown error",
    };
  }
  if (typeof error === "string") {
    return { message: error || "Unknown error", details: error || "Unknown error" };
  }

  try {
    const json = JSON.stringify(error);
    if (json && json !== "{}") {
      return { message: "Unexpected error", details: json };
    }
  } catch {
    // no-op
  }

  return { message: "Unexpected error", details: String(error) };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const rawUsername = String(body.username ?? "");
  const normalizedRawUsername = normalizeUsername(rawUsername);
  const username = normalizedRawUsername
    ? normalizedRawUsername.includes("@")
      ? makeUsernameFromEmail(normalizedRawUsername)
      : normalizedRawUsername
    : makeUsernameFromEmail(email);
  const password = String(body.password ?? "");
  const name = String(body.name ?? "")
    .trim()
    .slice(0, 80);

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Username format invalid" },
      { status: 400 },
    );
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json(
      { error: "Password must be between 8 and 72 characters" },
      { status: 400 },
    );
  }

  try {
    const convex = getConvexHttpClient();
    const created = await convex.mutation(userRefs.createUser, {
      username,
      email,
      passwordHash: hashPassword(password),
      name: name || undefined,
    });

    let emailSent = false;
    let emailWarning: string | undefined;
    try {
      const sentResult = await sendWelcomeEmail({
        to: email,
        username,
        name: name || undefined,
      });
      emailSent = sentResult.sent;
      if (!sentResult.sent && sentResult.reason) {
        emailWarning = sentResult.reason;
      }
    } catch (error) {
      console.error("Welcome email send failed", error);
      emailWarning =
        "Akkaunt yaratildi, lekin welcome email yuborilmadi. RESEND sozlamasini tekshiring.";
    }

    return NextResponse.json(
      { ok: true, ...created, emailSent, emailWarning },
      { status: 201 },
    );
  } catch (error) {
    const described = describeError(error);
    const message =
      described.message === "Unknown error"
        ? "Convex request failed while creating user"
        : described.message || "Failed to create user";
    const lower = message.toLowerCase();
    if (lower.includes("already exists")) {
      return NextResponse.json(
        {
          error: lower.includes("email")
            ? "Email already exists"
            : "Username already exists",
        },
        { status: 409 },
      );
    }
    if (
      lower.includes("could not find public function") ||
      lower.includes("does not exist") ||
      lower.includes("invalid convex") ||
      lower.includes("unauthorized")
    ) {
      return NextResponse.json(
        {
          error:
            "Convex backend sync/auth muammosi. `npx convex dev` ni qayta ishga tushiring va login qiling.",
          details: described.details,
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: message, details: described.details },
      { status: 500 },
    );
  }
}

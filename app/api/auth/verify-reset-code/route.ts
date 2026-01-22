import { NextResponse } from "next/server";
import { verifyResetCode } from "@/services/Users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { error: "missing_fields", message: "Email и код обязательны" },
        { status: 400 }
      );
    }

    // Verify the code
    const result = await verifyResetCode(email.toLowerCase().trim(), code.trim());

    if (!result.valid) {
      const errorMessages: Record<string, string> = {
        invalid_code: "Неверный код подтверждения",
        code_expired: "Код подтверждения истёк. Запросите новый код.",
      };

      return NextResponse.json(
        {
          error: result.error,
          message: errorMessages[result.error || 'invalid_code'] || "Ошибка проверки кода"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Код подтверждён"
    });

  } catch (error) {
    console.error("[VERIFY RESET CODE ERROR]", error);
    return NextResponse.json(
      { error: "server_error", message: "Произошла ошибка сервера" },
      { status: 500 }
    );
  }
}

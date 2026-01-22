import { NextResponse } from "next/server";
import { verifyResetCode, resetPassword } from "@/services/Users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    // Validate required fields
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "missing_fields", message: "Все поля обязательны" },
        { status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "weak_password", message: "Пароль должен содержать минимум 6 символов" },
        { status: 400 }
      );
    }

    // Verify the code first
    const verification = await verifyResetCode(email.toLowerCase().trim(), code.trim());

    if (!verification.valid || !verification.userId) {
      const errorMessages: Record<string, string> = {
        invalid_code: "Неверный код подтверждения",
        code_expired: "Код подтверждения истёк. Запросите новый код.",
      };

      return NextResponse.json(
        {
          error: verification.error,
          message: errorMessages[verification.error || 'invalid_code'] || "Ошибка проверки кода"
        },
        { status: 400 }
      );
    }

    // Reset the password
    await resetPassword(verification.userId, newPassword);

    return NextResponse.json({
      success: true,
      message: "Пароль успешно изменён"
    });

  } catch (error) {
    console.error("[RESET PASSWORD ERROR]", error);
    return NextResponse.json(
      { error: "server_error", message: "Произошла ошибка сервера" },
      { status: 500 }
    );
  }
}

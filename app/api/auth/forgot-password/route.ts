import { NextResponse } from "next/server";
import { findByEmailAndPhone, createPasswordResetToken } from "@/services/Users";
import { sendPasswordResetEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    // Validate required fields
    if (!email || !phone) {
      return NextResponse.json(
        { error: "missing_fields", message: "Все поля обязательны для заполнения" },
        { status: 400 }
      );
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Find user by email and phone
    const user = await findByEmailAndPhone(email.toLowerCase().trim(), normalizedPhone);

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: "Если данные верны, код будет отправлен на указанную почту" }
      );
    }

    // Get brand name for email
    const userBrandName = user.Brands?.[0]?.name || "Продавец";

    // Generate reset code and save to database
    const resetCode = await createPasswordResetToken(user.id, 30);

    // Send reset email
    await sendPasswordResetEmail({
      to: user.email,
      brandName: userBrandName,
      resetCode,
      expiresInMinutes: 30,
    });

    return NextResponse.json({
      success: true,
      message: "Код для сброса пароля отправлен на вашу почту"
    });

  } catch (error) {
    console.error("[FORGOT PASSWORD ERROR]", error);
    return NextResponse.json(
      { error: "server_error", message: "Произошла ошибка сервера" },
      { status: 500 }
    );
  }
}

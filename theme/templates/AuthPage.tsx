'use client'

import Link from "next/link";
import {type FormEvent, useMemo, useState} from "react";
import {Input} from "@nextui-org/input";
import {Checkbox, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";

type AuthPageProps = {
  mode: "login" | "register";
};

type AccountType = "customer" | "seller";

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
  accountType: AccountType;
  brandName: string;
  instagram: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  remember: true,
  accountType: "seller", // Временно только продавцы
  brandName: "",
  instagram: "",
};

const COPY = {
  login: {
    title: "Войти в кабинет продавца",
    subtitle: "Привет! Рады видеть вас снова.",
    actionLabel: "Войти",
    switchLabel: "Нет аккаунта?",
    switchCta: "Зарегистрироваться",
    switchHref: "/register",
  },
  register: {
    title: "Создать аккаунт продавца",
    subtitle: "Присоединяйтесь к сообществу мастеров.",
    actionLabel: "Создать аккаунт",
    switchLabel: "Уже есть аккаунт?",
    switchCta: "Войти",
    switchHref: "/login",
  },
} as const;

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const formatBelarusPhone = (value: string) => {
  let digits = normalizeDigits(value);
  if (digits.startsWith("80")) {
    digits = `375${digits.slice(1)}`;
  } else if (!digits.startsWith("375")) {
    digits = `375${digits.replace(/^375/, "")}`;
  }

  const rest = digits.replace(/^375/, "").slice(0, 9);
  const parts = [
    rest.slice(0, 2),
    rest.slice(2, 5),
    rest.slice(5, 7),
    rest.slice(7, 9),
  ];

  const formatted = [
    "+375",
    parts[0] ? ` (${parts[0]}` : " (",
    parts[0] && parts[0].length === 2 ? ")" : "",
    parts[1] ? ` ${parts[1]}` : "",
    parts[2] ? `-${parts[2]}` : "",
    parts[3] ? `-${parts[3]}` : "",
  ].join("");

  return formatted.trimEnd();
};

const getPhoneDigitsCount = (value: string) => normalizeDigits(value.replace(/^375/, "")).length;

type ForgotPasswordStep = "form" | "code" | "newPassword" | "success";

type ForgotPasswordForm = {
  email: string;
  phone: string;
  code: string;
  newPassword: string;
  confirmNewPassword: string;
};

export default function AuthPage({mode}: AuthPageProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password modal state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>("form");
  const [forgotPasswordForm, setForgotPasswordForm] = useState<ForgotPasswordForm>({
    email: "",
    phone: "",
    code: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [forgotPasswordError, setForgotPasswordError] = useState<string | null>(null);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const copy = COPY[mode];
  const isRegister = mode === "register";
  const phoneLabel = "Телефон";
  const passwordGridClass = useMemo(() => (isRegister ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"), [isRegister]);
  const googleLabel = isRegister ? "Продолжить через Google" : "Войти через Google";

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (isRegister && !form.name.trim()) {
      nextErrors.name = "Укажите имя";
    }
    if (isRegister) {
      if (!form.email.trim()) {
        nextErrors.email = "Нужен email";
      } else if (!emailRegex.test(form.email.trim())) {
        nextErrors.email = "Проверьте email";
      }
    }
    const phoneDigits = getPhoneDigitsCount(form.phone);
    if (!form.phone.trim()) {
      if (!isRegister) {
        nextErrors.phone = "Введите телефон";
      }
    } else if (phoneDigits < 9) {
      nextErrors.phone = "Добавьте корректный номер Беларуси";
    }
    if (!form.password.trim()) {
      nextErrors.password = "Введите пароль";
    } else if (form.password.trim().length < 6) {
      nextErrors.password = "Минимум 6 символов";
    }
    if (isRegister) {
      if (!form.confirmPassword.trim()) {
        nextErrors.confirmPassword = "Повторите пароль";
      } else if (form.confirmPassword.trim() !== form.password.trim()) {
        nextErrors.confirmPassword = "Пароли не совпадают";
      }

      // Validate seller-specific fields
      if (form.accountType === "seller") {
        if (!form.brandName.trim()) {
          nextErrors.brandName = "Укажите название бренда";
        }
        if (!form.instagram.trim()) {
          nextErrors.instagram = "Укажите Instagram";
        } else if (!form.instagram.trim().match(/^@?[\w.]+$/)) {
          nextErrors.instagram = "Некорректный Instagram";
        }
      }
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      setStatus("idle");
      setStatusMessage(null);
      return;
    }
    setErrors({});
    setStatus("success");
    setStatusMessage(null);
  };

  const handleGoogleClick = () => {
    setStatus("success");
    setStatusMessage(
      isRegister
        ? "Кнопка Google нажата. Подключите Google OAuth/NextAuth для реальной регистрации."
        : "Кнопка Google нажата. Подключите Google OAuth/NextAuth для реального входа."
    );
  };

  const passwordType = showPassword ? "text" : "password";

  // Forgot password handlers
  const handleForgotPasswordChange = (field: keyof ForgotPasswordForm, value: string) => {
    setForgotPasswordForm((prev) => ({...prev, [field]: value}));
    setForgotPasswordError(null);
  };

  const resetForgotPasswordModal = () => {
    setForgotPasswordStep("form");
    setForgotPasswordForm({
      email: "",
      phone: "",
      code: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setForgotPasswordError(null);
    setForgotPasswordLoading(false);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    resetForgotPasswordModal();
  };

  const handleRequestResetCode = async () => {
    const {email, phone} = forgotPasswordForm;

    if (!email.trim() || !phone.trim()) {
      setForgotPasswordError("Заполните все поля");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: email.trim(),
          phone: normalizeDigits(phone),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotPasswordError(data.message || "Произошла ошибка");
        return;
      }

      setForgotPasswordStep("code");
    } catch {
      setForgotPasswordError("Ошибка соединения с сервером");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const {email, code} = forgotPasswordForm;

    if (!code.trim() || code.trim().length !== 6) {
      setForgotPasswordError("Введите 6-значный код");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      const response = await fetch("/api/auth/verify-reset-code", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotPasswordError(data.message || "Неверный код");
        return;
      }

      setForgotPasswordStep("newPassword");
    } catch {
      setForgotPasswordError("Ошибка соединения с сервером");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const {email, code, newPassword, confirmNewPassword} = forgotPasswordForm;

    if (!newPassword.trim()) {
      setForgotPasswordError("Введите новый пароль");
      return;
    }

    if (newPassword.trim().length < 6) {
      setForgotPasswordError("Пароль должен содержать минимум 6 символов");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotPasswordError("Пароли не совпадают");
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword: newPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setForgotPasswordError(data.message || "Ошибка сброса пароля");
        return;
      }

      setForgotPasswordStep("success");
    } catch {
      setForgotPasswordError("Ошибка соединения с сервером");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <section className="w-full px-4 pb-14 pt-6 sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-lg shadow-slate-200/60">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-2">
              <Link href="/" className="text-base font-semibold lowercase tracking-tight text-purple-700 hover:text-purple-800">
                spraby
              </Link>
              <p className="text-xl font-semibold text-gray-900 sm:text-2xl">{copy.title}</p>
              <p className="text-sm text-gray-500">{copy.subtitle}</p>
            </div>
          </div>

          <form className="space-y-5 px-6 py-6 sm:px-7 sm:py-7" onSubmit={handleSubmit}>
            {/* Google OAuth - временно отключено
            <button
              type="button"
              onClick={handleGoogleClick}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <GoogleIcon/>
              {googleLabel}
            </button>

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-400">
              <span className="h-px flex-1 bg-gray-200"/>
              <span>или</span>
              <span className="h-px flex-1 bg-gray-200"/>
            </div>
            */}

            {/* Выбор типа аккаунта - временно только продавец
            {isRegister && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Тип аккаунта</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange("accountType", "customer")}
                    className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
                      form.accountType === "customer"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">🛍️</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Покупатель</p>
                      <p className="text-xs text-gray-500">Покупать товары</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange("accountType", "seller")}
                    className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
                      form.accountType === "seller"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">🏪</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Продавец</p>
                      <p className="text-xs text-gray-500">Продавать товары</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
            */}

            <Input
              type="tel"
              label={phoneLabel}
              variant="bordered"
              radius="sm"
              value={form.phone}
              onValueChange={(value) => handleChange("phone", formatBelarusPhone(value))}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
              classNames={{
                label: "text-sm font-semibold text-gray-700",
                inputWrapper: "bg-white",
              }}
              placeholder="+375 (29) 000-00-00"
            />

            {isRegister && (
              <Input
                label="Имя"
                variant="bordered"
                radius="sm"
                value={form.name}
                onValueChange={(value) => handleChange("name", value)}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                classNames={{
                  label: "text-sm font-semibold text-gray-700",
                  inputWrapper: "bg-white",
                }}
                placeholder="Как к вам обращаться"
              />
            )}

            {isRegister && (
              <Input
                type="email"
                label="Email"
                variant="bordered"
                radius="sm"
                value={form.email}
                onValueChange={(value) => handleChange("email", value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                classNames={{
                  label: "text-sm font-semibold text-gray-700",
                  inputWrapper: "bg-white",
                }}
                placeholder="hello@spra.by"
              />
            )}

            {isRegister && form.accountType === "seller" && (
              <>
                <Input
                  label="Название бренда"
                  variant="bordered"
                  radius="sm"
                  value={form.brandName}
                  onValueChange={(value) => handleChange("brandName", value)}
                  isInvalid={!!errors.brandName}
                  errorMessage={errors.brandName}
                  classNames={{
                    label: "text-sm font-semibold text-gray-700",
                    inputWrapper: "bg-white",
                  }}
                  placeholder="spraby"
                />
                <Input
                  label="Instagram"
                  variant="bordered"
                  radius="sm"
                  value={form.instagram}
                  onValueChange={(value) => handleChange("instagram", value)}
                  isInvalid={!!errors.instagram}
                  errorMessage={errors.instagram}
                  classNames={{
                    label: "text-sm font-semibold text-gray-700",
                    inputWrapper: "bg-white",
                  }}
                  placeholder="spra.by"
                  startContent={
                    <span className="text-sm text-gray-400">@</span>
                  }
                />
              </>
            )}

            <div className={passwordGridClass}>
              <Input
                type={passwordType}
                label="Пароль"
                variant="bordered"
                radius="sm"
                value={form.password}
                onValueChange={(value) => handleChange("password", value)}
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                classNames={{
                  label: "text-sm font-semibold text-gray-700",
                  inputWrapper: "bg-white",
                }}
                placeholder="Минимум 6 символов"
                endContent={
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-wide text-purple-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "скрыть" : "показать"}
                  </button>
                }
              />

              {isRegister && (
                <Input
                  type={passwordType}
                  label="Повторите пароль"
                  variant="bordered"
                  radius="sm"
                  value={form.confirmPassword}
                  onValueChange={(value) => handleChange("confirmPassword", value)}
                  isInvalid={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword}
                  classNames={{
                    label: "text-sm font-semibold text-gray-700",
                    inputWrapper: "bg-white",
                  }}
                  placeholder="Ещё раз пароль"
                />
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Checkbox
                isSelected={form.remember}
                onValueChange={(value) => handleChange("remember", value)}
                classNames={{
                  label: "text-sm text-gray-700",
                  wrapper: "border border-gray-200",
                }}
              >
                Запомнить меня
              </Checkbox>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                >
                  Забыли пароль?
                </button>
              )}
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              {copy.actionLabel}
            </button>

            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
              <span className="text-gray-600">{copy.switchLabel}</span>
              <Link href={copy.switchHref} className="font-semibold text-purple-600 hover:text-purple-700">
                {copy.switchCta}
              </Link>
            </div>

            {status === "success" && (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-semibold text-white">
                  ✓
                </span>
                <div>
                  <p className="font-semibold">
                    {isRegister ? "Почти готово" : "Успешно"}
                  </p>
                  <p>
                    {statusMessage
                      ? statusMessage
                      : isRegister
                        ? "Мы сохранили данные формы. Подключите API или бекенд, чтобы завершить регистрацию."
                        : "Форма отправлена. Добавьте реальный обработчик входа, когда бекенд будет готов."}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotPasswordOpen}
        onClose={handleForgotPasswordClose}
        placement="center"
        classNames={{
          base: "max-w-md",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {forgotPasswordStep === "form" && "Восстановление пароля"}
                {forgotPasswordStep === "code" && "Введите код"}
                {forgotPasswordStep === "newPassword" && "Новый пароль"}
                {forgotPasswordStep === "success" && "Пароль изменён"}
              </ModalHeader>
              <ModalBody>
                {forgotPasswordStep === "form" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Введите данные вашего аккаунта. Если они совпадают, мы отправим код для сброса пароля на вашу почту.
                    </p>
                    <Input
                      type="email"
                      label="Email"
                      variant="bordered"
                      radius="sm"
                      value={forgotPasswordForm.email}
                      onValueChange={(value) => handleForgotPasswordChange("email", value)}
                      classNames={{
                        label: "text-sm font-semibold text-gray-700",
                        inputWrapper: "bg-white",
                      }}
                      placeholder="hello@spra.by"
                    />
                    <Input
                      type="tel"
                      label="Телефон"
                      variant="bordered"
                      radius="sm"
                      value={forgotPasswordForm.phone}
                      onValueChange={(value) => handleForgotPasswordChange("phone", formatBelarusPhone(value))}
                      classNames={{
                        label: "text-sm font-semibold text-gray-700",
                        inputWrapper: "bg-white",
                      }}
                      placeholder="+375 (29) 000-00-00"
                    />
                  </div>
                )}

                {forgotPasswordStep === "code" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Мы отправили 6-значный код на <strong>{forgotPasswordForm.email}</strong>. Введите его ниже.
                    </p>
                    <Input
                      label="Код подтверждения"
                      variant="bordered"
                      radius="sm"
                      value={forgotPasswordForm.code}
                      onValueChange={(value) => handleForgotPasswordChange("code", value.replace(/\D/g, "").slice(0, 6))}
                      classNames={{
                        label: "text-sm font-semibold text-gray-700",
                        inputWrapper: "bg-white",
                      }}
                      placeholder="000000"
                      maxLength={6}
                    />
                    <p className="text-xs text-gray-500">
                      Код действителен в течение 30 минут
                    </p>
                  </div>
                )}

                {forgotPasswordStep === "newPassword" && (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Придумайте новый пароль для вашего аккаунта.
                    </p>
                    <Input
                      type="password"
                      label="Новый пароль"
                      variant="bordered"
                      radius="sm"
                      value={forgotPasswordForm.newPassword}
                      onValueChange={(value) => handleForgotPasswordChange("newPassword", value)}
                      classNames={{
                        label: "text-sm font-semibold text-gray-700",
                        inputWrapper: "bg-white",
                      }}
                      placeholder="Минимум 6 символов"
                    />
                    <Input
                      type="password"
                      label="Повторите пароль"
                      variant="bordered"
                      radius="sm"
                      value={forgotPasswordForm.confirmNewPassword}
                      onValueChange={(value) => handleForgotPasswordChange("confirmNewPassword", value)}
                      classNames={{
                        label: "text-sm font-semibold text-gray-700",
                        inputWrapper: "bg-white",
                      }}
                      placeholder="Ещё раз новый пароль"
                    />
                  </div>
                )}

                {forgotPasswordStep === "success" && (
                  <div className="space-y-4 text-center py-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl">✓</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ваш пароль успешно изменён. Теперь вы можете войти с новым паролем.
                    </p>
                  </div>
                )}

                {forgotPasswordError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {forgotPasswordError}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                {forgotPasswordStep === "form" && (
                  <>
                    <Button variant="light" onPress={handleForgotPasswordClose}>
                      Отмена
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleRequestResetCode}
                      isLoading={forgotPasswordLoading}
                      className="bg-purple-600"
                    >
                      Отправить код
                    </Button>
                  </>
                )}

                {forgotPasswordStep === "code" && (
                  <>
                    <Button variant="light" onPress={() => setForgotPasswordStep("form")}>
                      Назад
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleVerifyCode}
                      isLoading={forgotPasswordLoading}
                      className="bg-purple-600"
                    >
                      Подтвердить
                    </Button>
                  </>
                )}

                {forgotPasswordStep === "newPassword" && (
                  <>
                    <Button variant="light" onPress={() => setForgotPasswordStep("code")}>
                      Назад
                    </Button>
                    <Button
                      color="primary"
                      onPress={handleResetPassword}
                      isLoading={forgotPasswordLoading}
                      className="bg-purple-600"
                    >
                      Сохранить пароль
                    </Button>
                  </>
                )}

                {forgotPasswordStep === "success" && (
                  <Button
                    color="primary"
                    onPress={handleForgotPasswordClose}
                    className="bg-purple-600 w-full"
                  >
                    Войти
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}

const GoogleIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" role="img">
    <path fill="#EA4335" d="M12 10.2v3.92h5.45c-.24 1.4-.98 2.59-2.08 3.38l3.35 2.6c1.96-1.8 3.09-4.45 3.09-7.6 0-.73-.06-1.44-.18-2.12H12Z"/>
    <path fill="#34A853" d="M6.62 14.32 5.95 14.8l-2.68 2.07C5.23 20.56 8.35 22.5 12 22.5c2.7 0 4.96-.89 6.62-2.4l-3.35-2.6c-.93.64-2.12 1.03-3.27 1.03-2.5 0-4.62-1.68-5.38-3.98Z"/>
    <path fill="#4A90E2" d="M3.27 6.69C2.46 8.16 2 9.83 2 11.5c0 1.67.46 3.34 1.27 4.81l3.35-2.6c-.2-.64-.31-1.31-.31-2.01 0-.7.11-1.37.31-2.01Z"/>
    <path fill="#FBBC05" d="M12 5.48c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.96 2.16 14.7 1.5 12 1.5 8.35 1.5 5.23 3.44 3.27 6.69l3.35 2.6c.76-2.3 2.88-3.98 5.38-3.98Z"/>
  </svg>
);

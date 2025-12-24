'use client'

import Link from "next/link";
import {type FormEvent, useMemo, useState} from "react";
import {Input} from "@nextui-org/input";
import {Checkbox} from "@nextui-org/react";

type AuthPageProps = {
  mode: "login" | "register";
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  remember: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  remember: true,
};

const COPY = {
  login: {
    title: "Войти в spraby",
    subtitle: "Привет! Рады видеть вас снова.",
    actionLabel: "Войти",
    switchLabel: "Нет аккаунта?",
    switchCta: "Зарегистрироваться",
    switchHref: "/register",
  },
  register: {
    title: "Создать аккаунт",
    subtitle: "Присоединяйтесь к сообществу мастеров и покупателей.",
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

export default function AuthPage({mode}: AuthPageProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
                placeholder="hello@spraby.com"
              />
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
                <Link href="#" className="text-sm font-semibold text-purple-600 hover:text-purple-700">
                  Забыли пароль?
                </Link>
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

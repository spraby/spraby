'use client'

import Link from "next/link";
import {type FormEvent, type KeyboardEvent, useLayoutEffect, useRef, useState} from "react";
import {Input} from "@nextui-org/input";
import {createRequest} from "@/services/BrandRequests";

type FormState = {
  name: string;
  email: string;
  phone: string;
  brandName: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  brandName: "",
};

/** Цифры абонентского номера после кода страны: (XX) XXX-XX-XX. */
const PHONE_DIGITS = 9;

/** Длина неизменяемого префикса «+375» в отформатированном значении. */
const PHONE_PREFIX_LENGTH = 4;

const isDigit = (char: string | undefined) => !!char && char >= "0" && char <= "9";

/**
 * Достаёт цифры абонентского номера и сообщает, сколько ведущих цифр ушло
 * на код страны — без этого не пересчитать позицию каретки.
 */
const parsePhone = (value: string) => {
  const all = value.replace(/\D/g, "");

  if (all.startsWith("375")) {
    return {digits: all.slice(3, 3 + PHONE_DIGITS), countryDigits: 3};
  }

  // Междугородний набор по Беларуси — 8 0XX XXX-XX-XX: «80» отбрасываем целиком.
  if (all.startsWith("80")) {
    return {digits: all.slice(2, 2 + PHONE_DIGITS), countryDigits: 2};
  }

  return {digits: all.slice(0, PHONE_DIGITS), countryDigits: 0};
};

const formatBelarusPhone = (digits: string) => {
  // Пустое остаётся пустым, иначе поле не очистить до конца, а телефон
  // в этой форме необязательный.
  if (!digits) {
    return "";
  }

  let formatted = `+375 (${digits.slice(0, 2)}`;

  if (digits.length >= 2) formatted += ")";
  if (digits.length > 2) formatted += ` ${digits.slice(2, 5)}`;
  if (digits.length > 5) formatted += `-${digits.slice(5, 7)}`;
  if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;

  return formatted;
};

/** Сколько цифр абонентского номера стоит левее каретки. */
const digitsBeforeCaret = (value: string, caret: number, countryDigits: number) =>
  Math.max(0, value.slice(0, caret).replace(/\D/g, "").length - countryDigits);

/** Позиция каретки в отформатированной строке сразу за нужной по счёту цифрой. */
const caretAfterDigits = (formatted: string, count: number) => {
  if (!formatted) {
    return 0;
  }

  if (count <= 0) {
    // Перед первой цифрой, то есть сразу за «+375 (».
    return Math.min(formatted.length, PHONE_PREFIX_LENGTH + 2);
  }

  let seen = 0;

  for (let i = PHONE_PREFIX_LENGTH; i < formatted.length; i++) {
    if (!isDigit(formatted[i])) continue;

    seen++;
    if (seen < count) continue;

    // Перепрыгиваем разделители, чтобы каретка не застревала перед «)».
    let caret = i + 1;
    while (caret < formatted.length && !isDigit(formatted[caret])) caret++;

    return caret;
  }

  return formatted.length;
};

export default function AuthPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phoneCaretRef = useRef<number | null>(null);

  // Значение поля пересобирается маской целиком, поэтому браузер ставит каретку
  // в конец. Возвращаем её на место сразу после коммита нового значения.
  useLayoutEffect(() => {
    const input = phoneInputRef.current;
    const caret = phoneCaretRef.current;

    if (!input || caret === null) {
      return;
    }

    phoneCaretRef.current = null;
    input.setSelectionRange(caret, caret);
  });

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({...prev, [field]: value}));
    if (errors[field]) {
      setErrors((prev) => {
        const next = {...prev};
        delete next[field];
        return next;
      });
    }
  };

  const applyPhone = (digits: string, caretDigits: number) => {
    const formatted = formatBelarusPhone(digits);

    phoneCaretRef.current = caretAfterDigits(formatted, caretDigits);
    handleChange("phone", formatted);
  };

  const handlePhoneValueChange = (value: string) => {
    const {digits, countryDigits} = parsePhone(value);
    // onValueChange вызывается синхронно внутри обработчика события, поэтому
    // в DOM ещё лежит «сырое» значение и актуальная каретка.
    const caret = phoneInputRef.current?.selectionStart ?? value.length;

    applyPhone(digits, Math.min(digitsBeforeCaret(value, caret, countryDigits), digits.length));
  };

  const handlePhoneKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace" && event.key !== "Delete") {
      return;
    }

    const input = phoneInputRef.current;

    if (!input || input.selectionStart === null || input.selectionStart !== input.selectionEnd) {
      // Выделение пользователь удаляет сам — дальше отработает handlePhoneValueChange.
      return;
    }

    const {digits, countryDigits} = parsePhone(input.value);
    const before = digitsBeforeCaret(input.value, input.selectionStart, countryDigits);
    const index = event.key === "Backspace" ? before - 1 : before;

    // Удаляем всегда цифру, а не символ под кареткой. Иначе Backspace съедал бы
    // «)» или «-», маска тут же дорисовывала бы их обратно, и цифры в скобках
    // не удалялись бы вовсе — приходилось выделять их вручную.
    event.preventDefault();

    if (index < 0 || index >= digits.length) {
      return;
    }

    applyPhone(`${digits.slice(0, index)}${digits.slice(index + 1)}`, index);
  };

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!form.email.trim()) {
      nextErrors.email = "Нужен email";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = "Проверьте email";
    }

    if (!form.name.trim()) {
      nextErrors.name = "Укажите имя";
    }
    const phoneDigits = parsePhone(form.phone).digits.length;
    if (form.phone.trim() && phoneDigits < PHONE_DIGITS) {
      nextErrors.phone = "Добавьте корректный номер Беларуси";
    }
    if (!form.brandName.trim()) {
      nextErrors.brandName = "Укажите название бренда";
    }
    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length) {
      setErrors(validation);
      setStatus("idle");
      setErrorMessage(null);
      return;
    }

    setErrors({});
    setStatus("loading");
    setErrorMessage(null);

    const result = await createRequest({
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      name: form.name.trim(),
      brand_name: form.brandName.trim(),
    });

    if (result.success) {
      setStatus("success");
      setForm(initialFormState);
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Произошла ошибка");
    }
  };

  const isLoading = status === "loading";

  return (
    <section className="w-full px-4 pb-14 pt-6 sm:px-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-lg shadow-slate-200/60">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  aria-label="Вернуться на главную"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-purple-100 bg-purple-50 text-purple-700 transition hover:border-purple-200 hover:bg-purple-100 hover:text-purple-800"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M15 5L8 12L15 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <Link href="/" className="text-base font-semibold lowercase tracking-tight text-purple-700 hover:text-purple-800">
                  spraby
                </Link>
              </div>
              <p className="text-xl font-semibold text-gray-900 sm:text-2xl">Стать продавцом</p>
              <p className="text-sm text-gray-500">Оставьте заявку и мы свяжемся с вами для создания магазина.</p>
            </div>
          </div>

          <form className="space-y-5 px-6 py-6 sm:px-7 sm:py-7" onSubmit={handleSubmit}>
            <Input
              label="Имя"
              variant="bordered"
              radius="sm"
              value={form.name}
              onValueChange={(value) => handleChange("name", value)}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              isDisabled={isLoading}
              classNames={{
                label: "text-sm font-semibold text-gray-700",
                inputWrapper: "bg-white",
              }}
              placeholder="Как к вам обращаться"
            />

            <Input
              type="email"
              label="Email"
              variant="bordered"
              radius="sm"
              value={form.email}
              onValueChange={(value) => handleChange("email", value)}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              isDisabled={isLoading}
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
              ref={phoneInputRef}
              value={form.phone}
              onValueChange={handlePhoneValueChange}
              onKeyDown={handlePhoneKeyDown}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
              isDisabled={isLoading}
              classNames={{
                label: "text-sm font-semibold text-gray-700",
                inputWrapper: "bg-white",
              }}
              placeholder="+375 (29) 000-00-00"
            />

            <Input
              label="Название бренда"
              variant="bordered"
              radius="sm"
              value={form.brandName}
              onValueChange={(value) => handleChange("brandName", value)}
              isInvalid={!!errors.brandName}
              errorMessage={errors.brandName}
              isDisabled={isLoading}
              classNames={{
                label: "text-sm font-semibold text-gray-700",
                inputWrapper: "bg-white",
              }}
              placeholder="Название вашего магазина"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Отправка..." : "Отправить заявку"}
            </button>

            {status === "success" && (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-semibold text-white">
                  ✓
                </span>
                <div>
                  <p className="font-semibold">Заявка отправлена</p>
                  <p>Мы свяжемся с вами в ближайшее время для уточнения деталей и создания магазина.</p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-600 text-[10px] font-semibold text-white">
                  !
                </span>
                <div>
                  <p className="font-semibold">Ошибка</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

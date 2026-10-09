'use client'

import Link from "next/link";
import {type FormEvent, type KeyboardEvent, useLayoutEffect, useRef, useState} from "react";
import {Input} from "@nextui-org/input";
import {Select, SelectItem} from "@nextui-org/select";
import {EMPLOYMENT_TYPES} from "@/lib/employment-types";
import {createRequest} from "@/services/BrandRequests";

type FormState = {
  name: string;
  email: string;
  phone: string;
  brandName: string;
  employmentType: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialFormState: FormState = {
  name: "",
  email: "",
  phone: "",
  brandName: "",
  employmentType: "",
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

/**
 * Спираль из логотипа (public/img/spraby.svg). viewBox — квадрат вокруг центра
 * рисунка, чтобы при вращении знак не «гулял».
 */
const SprabyMark = ({className}: { className?: string }) => (
  <svg aria-hidden className={className} fill="currentColor" viewBox="0 -30.02 291.95 291.95">
    <path
      d="M268.09,139.3c2.4,39.09-19.92,76-56.2,95.93-31.29,17.23-70.79,19.46-103,2.64-35.4-18.52-56.67-57.43-45-94.29,10.49-32.94,45.53-59.66,84-53.8,16.58,2.58,32,10.84,42,23.44,14.35,18.23,17.63,41.9,4,61.3-4.1,5.68-11.49,10.66-18.4,13.18-13.07,4.87-33.05,2.7-45.3-8.38-4.51-4.1-8.09-12-7.27-18.34v-.06c.94-10.9,9.85-10.84,11.84-2.87a22.18,22.18,0,0,0,1.58,4.28A27.63,27.63,0,0,0,158.8,178.5c17.58,1.76,33-11.66,35.1-27.25,2.11-15.94-8.09-33-21.39-42.66-13.71-10-32.64-14-49.52-9-17.17,5-32.81,16.17-42.07,30.41-10.08,15.47-11.78,36.86-6.33,54,11.19,35.4,52.51,58.14,91.53,55.26,36.45-2.75,68.8-25.66,82.34-56.72,13.36-30.65,7.79-67.69-12.07-94.88-23.15-31.76-62.82-50.51-104-49.28C92.58,39.62,60.29,49.76,32.86,83.63,22.14,96.87,10,116,5.44,132.09c-8.62,30.42,14.47,46.41,26.08,9.67C37,124.47,44.7,107.24,57.65,93.41c27-28.89,69.21-39.67,109.06-29.53,32.17,8.2,56.55,30.94,65,60.77,7.67,27.19.76,58-22.39,77-24.79,20.45-60.77,24.61-89,7.56-14.24-8.61-25.19-22.33-27.36-38.15-2-15.29,2.58-30.65,14.82-41.25,10.14-8.85,24.32-13.36,38.39-10,13.71,3.22,24,12.3,26.78,25.08,2.93,13.83-13.89,22.09-18,8-1.82-6.22-4.75-12.25-9.26-16.24-4.34-3.75-8.32-4.86-14.24-4.51-15.29.94-26.9,17.52-26.25,30.94.82,17.17,8.61,26.31,20.92,34.58,27,18.16,66.1,10.31,84.21-14.89-.18.06-.3.06-.47.12a5.11,5.11,0,0,1,.35-.59,2.9,2.9,0,0,1,.18.53c16.17-25.9,15.7-57.31-4.11-81.51-15.11-18.46-37.85-29.54-62.76-31.41-48-3.58-90.65,31.46-101.09,73.36-11.31,45.25,16,92.89,60.54,113.52,41,18.92,90.3,18.57,127.63-5.57,39.09-25.26,69.45-72.32,64.29-116.44C292.18,112.46,266.74,116.68,268.09,139.3Z"
      transform="translate(-3.56 -38.33)"
    />
  </svg>
);

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
    if (!form.employmentType) {
      nextErrors.employmentType = "Выберите форму занятости";
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
      employment_type: form.employmentType,
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
    <section className="w-full px-4 py-10 sm:px-6">
      <div className="pointer-events-auto mx-auto w-full max-w-xl">
        <div className="rounded-2xl border border-white/20 bg-white shadow-2xl shadow-purple-950/30">
          <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-start gap-3">
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

                <Link href="/" className="flex flex-col items-center gap-1 justify-self-center text-base font-semibold lowercase tracking-tight text-gray-400 hover:text-gray-500">
                  <span className="transition-transform duration-500 ease-out hover:scale-125">
                    <SprabyMark className="h-14 w-14 animate-[spin_16s_linear_infinite] text-purple-600 motion-reduce:animate-none"/>
                  </span>
                  <span className="leading-none">spraby</span>
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

            <Select
              label="Форма занятости"
              variant="bordered"
              radius="sm"
              selectedKeys={form.employmentType ? [form.employmentType] : []}
              onSelectionChange={(keys) => {
                const [selected] = Array.from(keys as Set<string>);
                handleChange("employmentType", selected ?? "");
              }}
              isInvalid={!!errors.employmentType}
              errorMessage={errors.employmentType}
              isDisabled={isLoading}
              classNames={{
                label: "text-sm font-semibold text-gray-700",
                trigger: "bg-white",
              }}
              placeholder="Выберите форму занятости"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type.value}>{type.label}</SelectItem>
              ))}
            </Select>

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
                  <p className="font-semibold">Заявка отправлена!</p>
                  <p>Совсем скоро вы получите письмо для завершения регистрации.</p>
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

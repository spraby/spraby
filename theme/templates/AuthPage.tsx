'use client'

import Link from "next/link";
import {type FormEvent, useState} from "react";
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

export default function AuthPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!form.name.trim()) {
      nextErrors.name = "Укажите имя";
    }
    if (!form.email.trim()) {
      nextErrors.email = "Нужен email";
    } else if (!emailRegex.test(form.email.trim())) {
      nextErrors.email = "Проверьте email";
    }
    const phoneDigits = getPhoneDigitsCount(form.phone);
    if (form.phone.trim() && phoneDigits < 9) {
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
              <Link href="/" className="text-base font-semibold lowercase tracking-tight text-purple-700 hover:text-purple-800">
                spraby
              </Link>
              <p className="text-xl font-semibold text-gray-900 sm:text-2xl">Стать продавцом</p>
              <p className="text-sm text-gray-500">Оставьте заявку и мы свяжемся с вами для создания магазина</p>
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
              value={form.phone}
              onValueChange={(value) => handleChange("phone", formatBelarusPhone(value))}
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
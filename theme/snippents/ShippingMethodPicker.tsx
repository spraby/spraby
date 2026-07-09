'use client'

import {Input, Textarea} from "@nextui-org/input";

export type StoreShippingField = {
  key: string;
  name: string;
  type: string;
  value: string | string[];
};

export type StoreShippingMethod = {
  id: string;
  name: string;
  description: string | null;
  merchantFields: StoreShippingField[];
  customerFields: StoreShippingField[];
};

export type ShippingSelection = {
  methodId: string | null;
  values: Record<string, string>;
};

export type ShippingErrors = {
  methodError?: string;
  fieldErrors: Record<string, string>;
};

export const emptyShippingSelection = (): ShippingSelection => ({methodId: null, values: {}});

// Поля покупателя, для которых продавец задаёт список вариантов
// в парном поле своих настроек: покупатель выбирает из списка.
const OPTION_SOURCES: Record<string, string> = {
  pickup_point: 'pickup_points',
  city: 'shipping_cities',
  country: 'shipping_countries',
};

const OPTIONAL_CUSTOMER_FIELDS = ['comments'];

/**
 * Строки shipping_methods (serializeObject) → модель для UI.
 * Название/описание — из конструктора, поля — из снапшотов записи,
 * порядок — по position конструктора (его задаёт админ).
 */
export const normalizeShippingMethods = (rawMethods: any[]): StoreShippingMethod[] => {
  return (rawMethods ?? [])
    .filter(Boolean)
    .sort((a: any, b: any) =>
      (a.shipping_method_constructors?.position ?? 0) - (b.shipping_method_constructors?.position ?? 0))
    .map((method: any) => ({
      id: String(method.id),
      name: method.shipping_method_constructors?.name ?? '',
      description: method.shipping_method_constructors?.description ?? null,
      merchantFields: Array.isArray(method.merchant_settings) ? method.merchant_settings : [],
      customerFields: Array.isArray(method.customer_settings) ? method.customer_settings : [],
    }))
    .filter((method: StoreShippingMethod) => method.name.length > 0);
};

const merchantOptionsFor = (method: StoreShippingMethod, customerKey: string): string[] => {
  const sourceKey = OPTION_SOURCES[customerKey];
  if (!sourceKey) return [];
  const source = method.merchantFields.find(field => field.key === sourceKey);
  return Array.isArray(source?.value) ? source.value.filter(item => `${item}`.trim().length) : [];
};

const hasMerchantValue = (field: StoreShippingField): boolean => {
  return Array.isArray(field.value) ? field.value.length > 0 : `${field.value ?? ''}`.trim().length > 0;
};

/**
 * Способ обязателен (если у бренда есть способы), поля обязательны кроме комментария.
 * null — ошибок нет.
 */
export const validateShippingSelection = (
  methods: StoreShippingMethod[],
  selection: ShippingSelection,
): ShippingErrors | null => {
  if (!methods.length) return null;

  if (!selection.methodId) {
    return {methodError: 'Выберите способ доставки', fieldErrors: {}};
  }

  const method = methods.find(item => item.id === selection.methodId);
  if (!method) {
    return {methodError: 'Выберите способ доставки', fieldErrors: {}};
  }

  const fieldErrors: Record<string, string> = {};
  for (const field of method.customerFields) {
    if (OPTIONAL_CUSTOMER_FIELDS.includes(field.key)) continue;
    if (!`${selection.values[field.key] ?? ''}`.trim().length) {
      fieldErrors[field.key] = 'Заполните поле';
    }
  }

  return Object.keys(fieldErrors).length ? {fieldErrors} : null;
};

/**
 * Данные для order_shippings: снапшот способа + значения покупателя.
 * Пустой объект, если способ не выбран (у бренда нет способов доставки).
 */
export const buildOrderShippingData = (
  methods: StoreShippingMethod[],
  selection: ShippingSelection,
): Record<string, unknown> => {
  const method = methods.find(item => item.id === selection.methodId);
  if (!method) return {};

  return {
    shipping_method_id: BigInt(method.id),
    shipping_method_name: method.name,
    customer_settings: method.customerFields.map(field => ({
      key: field.key,
      name: field.name,
      type: field.type,
      value: `${selection.values[field.key] ?? ''}`.trim(),
    })),
  };
};

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 text-white" aria-hidden="true">
    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.79 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd"/>
  </svg>
);

export default function ShippingMethodPicker({
  methods,
  selection,
  errors,
  disabled,
  onChange,
}: {
  methods: StoreShippingMethod[];
  selection: ShippingSelection;
  errors: ShippingErrors | null;
  disabled?: boolean;
  onChange: (selection: ShippingSelection) => void;
}) {
  if (!methods.length) return null;

  const selectMethod = (methodId: string) => {
    if (disabled || selection.methodId === methodId) return;
    onChange({methodId, values: {}});
  };

  const setValue = (key: string, value: string) => {
    onChange({...selection, values: {...selection.values, [key]: value}});
  };

  const inputClassNames = {
    input: "text-sm",
    label: "text-xs font-medium text-gray-500"
  };

  return (
    <div className="flex flex-col gap-3">
      {errors?.methodError && (
        <p className="text-xs font-medium text-rose-500">{errors.methodError}</p>
      )}

      {methods.map((method) => {
        const isSelected = selection.methodId === method.id;
        const infoFields = method.merchantFields.filter(field => {
          if (!hasMerchantValue(field)) return false;
          // Список, из которого покупатель выбирает в парном поле — не дублируем в инфо
          const pairedCustomerKey = Object.keys(OPTION_SOURCES).find(key => OPTION_SOURCES[key] === field.key);
          return !(pairedCustomerKey && method.customerFields.some(f => f.key === pairedCustomerKey));
        });

        return (
          <div
            key={method.id}
            className={`rounded-xl border-2 transition ${isSelected ? 'border-purple-400 bg-purple-50/40' : 'border-gray-200 bg-white hover:border-purple-200'}`}
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => selectMethod(method.id)}
              className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 rounded-xl"
            >
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300 bg-white'}`}
              >
                {isSelected && <CheckIcon/>}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-gray-900">{method.name}</span>
                {method.description && (
                  <span className="text-xs text-gray-500">{method.description}</span>
                )}
              </span>
            </button>

            {isSelected && (infoFields.length > 0 || method.customerFields.length > 0) && (
              <div className="flex flex-col gap-4 border-t border-purple-100 p-4">
                {infoFields.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {infoFields.map(field => (
                      <div key={field.key} className="flex flex-wrap gap-1.5 text-xs">
                        <span className="text-gray-500">{field.name}:</span>
                        <span className="font-medium text-gray-800">
                          {Array.isArray(field.value) ? field.value.join(', ') : field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {method.customerFields.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {method.customerFields.map(field => {
                      const options = merchantOptionsFor(method, field.key);
                      const value = selection.values[field.key] ?? '';
                      const error = errors?.fieldErrors[field.key];

                      if (options.length > 0) {
                        return (
                          <div key={field.key} className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-500" htmlFor={`shipping-${method.id}-${field.key}`}>
                              {field.name}
                            </label>
                            <select
                              id={`shipping-${method.id}-${field.key}`}
                              value={value}
                              disabled={disabled}
                              onChange={(e) => setValue(field.key, e.target.value)}
                              className={`w-full rounded-xl border-2 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-purple-400 ${error ? 'border-rose-300' : 'border-gray-200'}`}
                            >
                              <option value="">Выберите...</option>
                              {options.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                            {error && <p className="text-xs text-rose-500">{error}</p>}
                          </div>
                        );
                      }

                      if (field.key === 'comments') {
                        return (
                          <Textarea
                            key={field.key}
                            value={value}
                            disabled={disabled}
                            variant="bordered"
                            label={field.name}
                            size="sm"
                            minRows={2}
                            errorMessage={error}
                            isInvalid={!!error}
                            classNames={inputClassNames}
                            onValueChange={(next) => setValue(field.key, next)}
                          />
                        );
                      }

                      return (
                        <Input
                          key={field.key}
                          value={value}
                          disabled={disabled}
                          variant="bordered"
                          label={field.name}
                          size="sm"
                          type={field.type === 'number' ? 'number' : 'text'}
                          errorMessage={error}
                          isInvalid={!!error}
                          classNames={inputClassNames}
                          onValueChange={(next) => setValue(field.key, next)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

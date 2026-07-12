'use client'

import {useId} from 'react';
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
const DEFAULT_HIDDEN_MERCHANT_INFO_KEYS: string[] = [];
const SHIPPING_METHOD_SUMMARY_KEYS = ['shipping_price', 'free_shipping_threshold', 'delivery_time'];
const SHIPPING_PRICE_FIELD_KEY = 'shipping_price';
const PICKUP_CUSTOMER_FIELD_KEY = 'pickup_point';
const PICKUP_MERCHANT_FIELD_KEY = 'pickup_points';
const FIELD_CONTROL_RADIUS_CLASS = 'rounded-xl';
const NEXTUI_FIELD_CONTROL_RADIUS_CLASS = '!rounded-xl';
const SELECT_FIELD_PLACEHOLDERS: Record<string, string> = {
  city: 'Выберите город',
  country: 'Выберите страну',
  pickup_point: 'Выберите пункт самовывоза',
};

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

const fieldValueText = (field: StoreShippingField): string => {
  return Array.isArray(field.value)
    ? field.value.filter(Boolean).join(', ')
    : `${field.value ?? ''}`.trim();
};

const isPickupShippingMethod = (method: StoreShippingMethod): boolean => {
  return method.customerFields.some(field => field.key === PICKUP_CUSTOMER_FIELD_KEY)
    || method.merchantFields.some(field => field.key === PICKUP_MERCHANT_FIELD_KEY);
};

const methodSummaryFields = (method: StoreShippingMethod): StoreShippingField[] => {
  const fields = SHIPPING_METHOD_SUMMARY_KEYS
    .map(key => method.merchantFields.find(field => field.key === key))
    .filter((field): field is StoreShippingField => Boolean(field && hasMerchantValue(field)));

  const hasShippingPrice = fields.some(field => field.key === SHIPPING_PRICE_FIELD_KEY);
  if (!hasShippingPrice && isPickupShippingMethod(method)) {
    return [
      {key: SHIPPING_PRICE_FIELD_KEY, name: 'Стоимость доставки', type: 'string', value: '0'},
      ...fields,
    ];
  }

  return fields;
};

const selectFieldPlaceholder = (field: StoreShippingField): string => {
  return SELECT_FIELD_PLACEHOLDERS[field.key] ?? `Выберите ${field.name.toLocaleLowerCase('ru-RU')}`;
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
  variant = 'cards',
  hiddenMerchantInfoKeys = DEFAULT_HIDDEN_MERCHANT_INFO_KEYS,
  onChange,
}: {
  methods: StoreShippingMethod[];
  selection: ShippingSelection;
  errors: ShippingErrors | null;
  disabled?: boolean;
  variant?: 'cards' | 'select';
  hiddenMerchantInfoKeys?: string[];
  onChange: (selection: ShippingSelection) => void;
}) {
  const fieldIdPrefix = useId();
  if (!methods.length) return null;

  const selectMethod = (methodId: string) => {
    if (disabled || selection.methodId === methodId) return;
    onChange(methodId ? {methodId, values: {}} : emptyShippingSelection());
  };

  const setValue = (key: string, value: string) => {
    onChange({...selection, values: {...selection.values, [key]: value}});
  };

  const inputClassNames = {
    input: "text-sm",
    label: "text-xs font-medium text-gray-500",
    inputWrapper: NEXTUI_FIELD_CONTROL_RADIUS_CLASS,
  };

  const selectedMethod = methods.find(method => method.id === selection.methodId);

  const renderMethodDetails = (
    method: StoreShippingMethod,
    showTopBorder = true,
    additionalHiddenMerchantInfoKeys: string[] = [],
    compactSelectFields = false,
  ) => {
    const infoFields = method.merchantFields.filter(field => {
      if (!hasMerchantValue(field)) return false;
      if ([...hiddenMerchantInfoKeys, ...additionalHiddenMerchantInfoKeys].includes(field.key)) return false;
      // Список, из которого покупатель выбирает в парном поле — не дублируем в инфо
      const pairedCustomerKey = Object.keys(OPTION_SOURCES).find(key => OPTION_SOURCES[key] === field.key);
      return !(pairedCustomerKey && method.customerFields.some(f => f.key === pairedCustomerKey));
    });

    if (infoFields.length === 0 && method.customerFields.length === 0) {
      return null;
    }

    return (
      <div className={`flex flex-col gap-4 p-4 ${showTopBorder ? 'border-t border-purple-100' : ''}`}>
        {infoFields.length > 0 && (
          <div className="grid gap-1.5">
            {infoFields.map(field => (
              <div key={field.key} className="min-w-0 overflow-x-auto whitespace-nowrap text-xs no-scrollbar">
                <span className="text-gray-500">{field.name}: </span>
                <span className="font-medium text-gray-800">{fieldValueText(field)}</span>
              </div>
            ))}
          </div>
        )}

        {method.customerFields.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {method.customerFields.map(field => {
              const options = merchantOptionsFor(method, field.key);
              const value = selection.values[field.key] ?? '';
              const error = errors?.fieldErrors[field.key];
              const isWideField = field.key === 'pickup_point' || field.key === 'comments';

              if (options.length > 0) {
                const placeholder = compactSelectFields ? selectFieldPlaceholder(field) : 'Выберите...';

                return (
                  <div key={field.key} className={`flex flex-col ${compactSelectFields ? '' : 'gap-1'} ${isWideField ? 'sm:col-span-2' : ''}`}>
                    {!compactSelectFields && (
                      <label className="text-xs font-medium text-gray-500" htmlFor={`${fieldIdPrefix}-${method.id}-${field.key}`}>
                        {field.name}
                      </label>
                    )}
                    <div className="relative">
                      <select
                        id={`${fieldIdPrefix}-${method.id}-${field.key}`}
                        value={value}
                        disabled={disabled}
                        aria-label={field.name}
                        onChange={(e) => setValue(field.key, e.target.value)}
                        className={`w-full appearance-none ${FIELD_CONTROL_RADIUS_CLASS} border-2 bg-white px-4 py-3 pr-11 text-sm font-semibold outline-none transition focus:border-purple-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${!value && compactSelectFields ? 'text-gray-500' : 'text-gray-900'} ${error ? 'border-rose-300' : 'border-gray-200'}`}
                      >
                        <option value="">{placeholder}</option>
                        {options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      >
                        <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    {error && <p className="text-xs text-rose-500">{error}</p>}
                  </div>
                );
              }

              if (field.key === 'comments') {
                return (
                  <div key={field.key} className="sm:col-span-2">
                    <Textarea
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
                  </div>
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
    );
  };

  const selectedMethodSummaryFields = selectedMethod ? methodSummaryFields(selectedMethod) : [];
  const selectedMethodDetails = selectedMethod
    ? renderMethodDetails(selectedMethod, false, SHIPPING_METHOD_SUMMARY_KEYS, true)
    : null;

  if (variant === 'select') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500" htmlFor={`${fieldIdPrefix}-method`}>
            Способ доставки
          </label>
          <div className="relative">
            <select
              id={`${fieldIdPrefix}-method`}
              value={selection.methodId ?? ''}
              disabled={disabled}
              onChange={(event) => selectMethod(event.target.value)}
              className={`w-full appearance-none ${FIELD_CONTROL_RADIUS_CLASS} border-2 bg-white px-3 py-2.5 pr-10 text-sm font-semibold text-gray-900 outline-none transition focus:border-purple-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 ${errors?.methodError ? 'border-rose-300' : 'border-gray-200'}`}
            >
              <option value="">Выберите способ доставки</option>
              {methods.map(method => (
                <option key={method.id} value={method.id}>{method.name}</option>
              ))}
            </select>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            >
              <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 011.06 0L10 10.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 8.28a.75.75 0 010-1.06z" clipRule="evenodd"/>
            </svg>
          </div>
          {errors?.methodError && (
            <p className="text-xs font-medium text-rose-500">{errors.methodError}</p>
          )}
          {selectedMethodSummaryFields.length > 0 && (
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs leading-relaxed text-gray-500">
              {selectedMethodSummaryFields.map(field => (
                <span key={field.key} className="whitespace-nowrap">
                  {field.name}: <span className="font-medium text-gray-800">{fieldValueText(field)}</span>
                </span>
              ))}
            </p>
          )}
        </div>

        {selectedMethodDetails && (
          <div className="rounded-xl border border-purple-100 bg-purple-50/30">
            {selectedMethodDetails}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {errors?.methodError && (
        <p className="text-xs font-medium text-rose-500">{errors.methodError}</p>
      )}

      {methods.map((method) => {
        const isSelected = selection.methodId === method.id;

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

            {isSelected && renderMethodDetails(method)}
          </div>
        );
      })}
    </div>
  );
}

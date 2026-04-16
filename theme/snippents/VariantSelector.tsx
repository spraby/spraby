'use client';

import {useEffect, useMemo, useState} from 'react';
import {VariantModel} from "@/prisma/types";
import {isEqual} from "lodash";
import {Select, SelectItem} from "@nextui-org/select";

const VariantSelector = ({variants, options = [], onChange, initialVariantId, selectedVariantId}: Props) => {
  const [activeVariantId, setActiveVariantId] = useState<string | null>(() => (
    getResolvedVariantId(variants, options, selectedVariantId ?? initialVariantId)
  ));

  useEffect(() => {
    const nextVariantId = getResolvedVariantId(variants, options, selectedVariantId ?? initialVariantId);
    setActiveVariantId(prev => prev === nextVariantId ? prev : nextVariantId);
  }, [initialVariantId, options, selectedVariantId, variants]);

  const selectedVariant = useMemo(() => {
    return resolveVariant(variants, options, activeVariantId);
  }, [activeVariantId, options, variants]);

  const selectedOptions = useMemo(() => {
    if (!selectedVariant) return {};
    if (!options.length) return {};
    return getVariantOptionsData(selectedVariant);
  }, [options.length, selectedVariant]);

  useEffect(() => {
    if (typeof onChange === 'function') onChange(selectedVariant);
  }, [onChange, selectedVariant]);

  const handleOptionChange = (value: string, id: string) => {
    const nextOptions = normalizeSelectedOptions(
      {
        ...selectedOptions,
        [id]: value
      },
      variants,
      options
    );

    const nextVariant = findVariantByOptions(variants, options, nextOptions)
      ?? resolveVariant(variants, options, activeVariantId);

    if (!nextVariant) return;
    setActiveVariantId(prev => prev === `${nextVariant.id}` ? prev : `${nextVariant.id}`);
  };

  return <>
    {
      options.map((option, index) => {
        const enabledValues = getEnabledValuesForOption(index, selectedOptions, variants, options);
        const optionKey = `${option.id}`;
        const selectedValue = selectedOptions[optionKey];

        return <Select
          key={optionKey}
          isDisabled={!enabledValues.length}
          label={option.label}
          onChange={({target}) => {
            handleOptionChange(target.value, `${option.id}`)
          }}
          selectedKeys={selectedValue ? [selectedValue] : []}
          disabledKeys={option.options.filter(i => !enabledValues.includes(i.value)).map(i => i.value)}
        >
          {
            option.options.map(option => <SelectItem key={option.value}>{option.label}</SelectItem>)
          }
        </Select>
      })
    }
  </>;
};

export default VariantSelector;

type Props = {
  variants: VariantModel[],
  options?: Options[],
  onChange?: (variant?: VariantModel) => any,
  initialVariantId?: string | number | bigint | null,
  selectedVariantId?: string | number | bigint | null,
}

type Options = {
  id: bigint,
  label: string,
  options: {
    label: string,
    value: string
    disabled?: boolean
  }[]
}

type SelectedOptions = {
  [key: string]: string
}

function isValidVariant(variant: VariantModel, options: Options[]) {
  if (!(options ?? []).length) return true;
  const optionIds = (options ?? []).map(i => i.id);
  return (variant.VariantValue ?? []).map(v => v.option_id).filter(i => optionIds.includes(i)).length === optionIds?.length;
}

function getVariantOptionsData(variant: VariantModel) {
  return (variant.VariantValue ?? []).reduce((acc: SelectedOptions, i) => {
    if (i.Value?.value) acc[`${i.option_id}`] = i.Value.value;
    return acc;
  }, {});
}

function getResolvedVariantId(
  variants: VariantModel[],
  options: Options[],
  preferredVariantId?: string | number | bigint | null,
) {
  const variant = resolveVariant(variants, options, preferredVariantId);
  return variant ? `${variant.id}` : null;
}

function resolveVariant(
  variants: VariantModel[],
  options: Options[],
  preferredVariantId?: string | number | bigint | null,
) {
  if (preferredVariantId !== undefined && preferredVariantId !== null && `${preferredVariantId}`.trim().length) {
    const preferredVariant = variants.find(v => `${v.id}` === `${preferredVariantId}`);
    if (preferredVariant && isValidVariant(preferredVariant, options)) return preferredVariant;
  }

  const firstOption = options.length ? options[0] : null;
  const firstOptionValue = firstOption?.options?.length ? firstOption.options[0].value : null;

  if (firstOption && firstOptionValue) {
    const firstValidVariant = variants.find(v => {
      if (!isValidVariant(v, options)) return false;
      return (v.VariantValue ?? []).some(item => item?.Value?.option_id === firstOption.id && item?.Value?.value === firstOptionValue);
    });
    if (firstValidVariant) return firstValidVariant;
  }

  return variants.find(variant => isValidVariant(variant, options));
}

function findVariantByOptions(variants: VariantModel[], options: Options[], selectedOptions: SelectedOptions) {
  if (!options.length) return undefined;

  return variants.find(variant => {
    if (!isValidVariant(variant, options)) return false;
    const variantOptionsData = getVariantOptionsData(variant);
    return Object.keys(variantOptionsData).length && isEqual(variantOptionsData, selectedOptions);
  });
}

function getEnabledValuesForOption(optionIndex: number, selectedOptions: SelectedOptions, variants: VariantModel[], options: Options[]) {
  const option = options[optionIndex];
  if (!option) return [];

  const prevOptions = options.slice(0, optionIndex);
  const prevOptionsData = prevOptions.reduce((acc: { id: bigint, value: string }[], item) => {
    const selectedValue = selectedOptions[`${item.id}`];
    if (selectedValue) {
      acc.push({
        id: item.id,
        value: selectedValue
      });
    }
    return acc;
  }, []);

  const enabledVariants = variants.filter(variant => {
    if (!isValidVariant(variant, options)) return false;
    const matchedValues = (variant.VariantValue ?? []).filter(value => {
      return prevOptionsData.find(prev => prev.id === value.Value?.option_id && prev.value === value.Value?.value);
    });
    return prevOptionsData.length === matchedValues.length;
  });

  const enabledValues = enabledVariants.reduce((acc: string[], variant) => {
    const value = (variant.VariantValue ?? []).find(item => item.option_id === option.id)?.Value?.value;
    if (value && !acc.includes(value)) acc.push(value);
    return acc;
  }, []);

  return option.options
    .map(item => item.value)
    .filter(value => enabledValues.includes(value));
}

function normalizeSelectedOptions(selectedOptions: SelectedOptions, variants: VariantModel[], options: Options[]) {
  if (!options.length) return selectedOptions;

  const normalized = {...selectedOptions};

  options.forEach((option, index) => {
    const enabledValues = getEnabledValuesForOption(index, normalized, variants, options);
    if (!enabledValues.length) return;

    const optionKey = `${option.id}`;
    if (!normalized[optionKey] || !enabledValues.includes(normalized[optionKey])) {
      normalized[optionKey] = enabledValues[0];
    }
  });

  return normalized;
}

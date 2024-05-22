'use client';

import {useEffect, useState} from 'react';
import Select from "@/theme/snippents/Select";
import {VariantModel} from "@/prisma/types";
import {isEqual} from "lodash";

const VariantSelector = ({variants, options = [], onChange}: Props) => {
  const [selectedOptions, setSelectedOption] = useState<SelectedOptions>({});

  useEffect(() => {
    const firstValidVariant = variants.find(i => isValidVariant(i, options))

    if (firstValidVariant) {
      const selectedOptionsData = getVariantOptionsData(firstValidVariant);
      setSelectedOption(selectedOptionsData);
    }
  }, []);

  useEffect(() => {
    const selectedVariant = variants.find(variant => {
      if (isValidVariant(variant, options)) {
        const variantOptionsData = getVariantOptionsData(variant);
        return Object.keys(variantOptionsData).length && isEqual(variantOptionsData, selectedOptions);
      }

      return false;
    });
    if (typeof onChange === 'function' && selectedVariant) onChange(selectedVariant);
  }, [selectedOptions]);

  /**
   *
   * @param value
   * @param id
   */
  const _onChange = (value: string, id: string) => {
    setSelectedOption(v => ({...v, [id]: value}));
  };

  return <>
    {
      options.map((i: any) =>
        <Select
          disabled={!selectedOptions[i.id]}
          key={i.id}
          label={i.label}
          value={selectedOptions[i.id]}
          options={i.options}
          onChange={(v: any) => _onChange(v, i.id)}
        />,
      )
    }
  </>;
};

export default VariantSelector;

type Props = {
  variants: VariantModel[],
  options?: Options[],
  onChange?: (variant: VariantModel) => any
}

type Options = {
  id: string,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}

type SelectedOptions = {
  [key: string]: string
}

function isValidVariant(variant: VariantModel, options: Options[]) {
  const optionIds = (options ?? []).map(i => i.id);
  return (variant.Values ?? []).map(v => v.optionId).filter(i => optionIds.includes(i)).length === optionIds?.length;
}

function getVariantOptionsData(variant: VariantModel) {
  return (variant.Values ?? []).reduce((acc: SelectedOptions, i) => {
    if (i.Value?.value) acc[i.optionId] = i.Value.value;
    return acc;
  }, {});
}

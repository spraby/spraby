'use client';

import {useEffect, useState} from 'react';
import {VariantModel} from "@/prisma/types";
import {isEqual} from "lodash";
import {Select, SelectItem} from "@nextui-org/select";

const VariantSelector = ({variants, options = [], onChange}: Props) => {
  const [selectedOptions, setSelectedOption] = useState<SelectedOptions>({});
  const [selectedVariant, setSelectedValiant] = useState<VariantModel>();

  useEffect(() => {
    //find first valid product variant by options
    const firstValidVariant = variants.find(i => isValidVariant(i, options))

    if (firstValidVariant) {
      //get options from product variant
      const selectedOptionsData = getVariantOptionsData(firstValidVariant);
      setSelectedOption(selectedOptionsData);
    }
  }, []);

  useEffect(() => {
    //on change product variant
    const selectedVariant = variants.find(variant => {
      if (isValidVariant(variant, options)) {
        const variantOptionsData = getVariantOptionsData(variant);
        return Object.keys(variantOptionsData).length && isEqual(variantOptionsData, selectedOptions);
      }
      return false;
    });

    setSelectedValiant(selectedVariant);
  }, [selectedOptions]);

  useEffect(() => {
    if (typeof onChange === 'function') onChange(selectedVariant);
  }, [selectedVariant]);

  /**
   *
   * @param value
   * @param id
   */
  const _onChange = (value: string, id: string) => {
    setSelectedOption(v => ({...v, [id]: value}));
  };

  return <>
    <div className={'flex flex-col gap-5'}>
      {
        // variants.map(i => {
        //   const value = i.Values?.map(i => i.Value?.value)?.join(',');
        //   return <div>{value}</div>
        // })
      }

    </div>
    {
      options.map((option, index) => {
        //get values prev options < index []
        const prevOptions = options.filter((_, y) => y < index)

        //get [optionId with value]
        const prevOptionsData = prevOptions.reduce((acc: { id: string, value: string }[], i) => {
          if (selectedOptions && i?.id && selectedOptions[i.id]) acc.push({id: i.id, value: selectedOptions[i.id]})
          return acc;
        }, []);

        const enabledVariants = variants.filter(i => {
          const iValues = (i.Values ?? []).filter(v => {
            return prevOptionsData.find(pod => pod.id === v.Value?.optionId && pod.value === v.Value?.value)
          });
          return prevOptionsData.length === iValues?.length
        })

        const enabledValues = enabledVariants.reduce((acc: string[], i) => {
          const value = (i.Values ?? []).find(j => j.optionId === option.id)
          if (value && value?.Value?.value) acc.push(value.Value.value)
          return acc;
        }, []);

        if (enabledValues?.length && !enabledValues.includes(selectedOptions[option.id]))
          setSelectedOption(v => ({...v, [option.id]: enabledValues[0]}))

        return <Select
          isDisabled={!selectedOptions[option.id] || !enabledValues.find(i => i === selectedOptions[option.id])}
          label={option.label}
          onChange={({target}) => {
            _onChange(target.value, option.id)
          }}
          selectedKeys={[selectedOptions[option.id]]}
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
  onChange?: (variant?: VariantModel) => any
}

type Options = {
  id: string,
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
  const optionIds = (options ?? []).map(i => i.id);
  return (variant.Values ?? []).map(v => v.optionId).filter(i => optionIds.includes(i)).length === optionIds?.length;
}

function getVariantOptionsData(variant: VariantModel) {
  return (variant.Values ?? []).reduce((acc: SelectedOptions, i) => {
    if (i.Value?.value) acc[i.optionId] = i.Value.value;
    return acc;
  }, {});
}

'use client';

import {useEffect, useMemo, useState} from 'react';
import Select from "@/theme/snippents/Select";

const VariantSelector = ({options = []}: Props) => {
  const [combination, setCombination] = useState(options?.length && options[0].options ? options[0].options[0].value : '');

  useEffect(() => {
  }, [combination]);

  useEffect(() => {
  }, []);

  /**
   *
   * @param value
   * @param id
   */
  const _onChange = (value: string, id: string) => {
    setCombination(value);
  };

  return combination && <>
    {
      options.map((i: any) =>
        <Select
          key={i.id}
          label={i.label}
          value={combination}
          options={i.options}
          onChange={(v: any) => _onChange(v, i.id)}
        />,
      )
    }
  </>;
};

export default VariantSelector;

type Props = {
  options?: Options[]
}

type Options = {
  id: string,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}

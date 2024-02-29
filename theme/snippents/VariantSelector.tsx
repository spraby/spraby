'use client';

import {useEffect, useMemo, useState} from 'react';
import Select from "@/theme/snippents/Select";

const VariantSelector = ({}) => {
  const [combination, setCombination] = useState('l');

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
      [{
        id: 'csacfs',
        label: 'Рамер',
        options: [
          {
            label: 'S',
            value: 's'
          },
          {
            label: 'M',
            value: 'm'
          },
          {
            label: 'L',
            value: 'l'
          }
        ]

      }].map((i: any) =>
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

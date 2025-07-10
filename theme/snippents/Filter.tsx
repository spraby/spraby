import {Checkbox} from "@nextui-org/react";

const Filter = ({filter, onChange, selected = []}: Props) => {
  return (
    filter && (
      <div className='flex gap-3 flex-col'>
        <h3 className='text-gray-800 font-bold text-sm'>{filter.title}</h3>
        <ul className='flex flex-col gap-2'>
          {
            filter.values.map((i: any, index: number) => {
              return (
                <li key={index} title={i.value}>
                  <Checkbox
                    color='default'
                    checked={selected?.includes(i.value)}
                    onValueChange={(v: boolean) => onChange(v, i)}
                  >{i.value}
                  </Checkbox>
                </li>
              );
            })
          }
        </ul>
      </div>
    )
  );
};

type Props = {
  filter: any
  selected?: string[],
  onChange: any
};

export default Filter;

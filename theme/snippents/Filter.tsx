import Checkbox from './Checkbox';

const Filter = ({filter, onChange, selected = []}: Props) => {
  return (
    filter && (
      <div className='flex gap-3 flex-col'>
        <h3 className='text-gray-800 font-bold text-sm'>{filter.title}</h3>
        <ul className='flex flex-col gap-2'>
          {
            filter.values.map((i: any, index: number) => {
              return (
                <li key={index}>
                  <Checkbox
                    checked={selected?.includes(i.value)}
                    label={i.value}
                    onChange={(v: boolean) => onChange(v, i)}
                  />
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

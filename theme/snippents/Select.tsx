'use client';

const Select = ({label, value, options, onChange, disabled = false}: Props) => {
  return (
    <label className={`w-full border border-gray-200 p-3 rounded-lg relative ${disabled ? 'opacity-55 cursor-not-allowed' : ''}`}>
      <span className='absolute -top-3 bg-white px-2'>{label}</span>
      <select
        disabled={disabled}
        className='w-full bg-white px-3 outline-none'
        onChange={(e: any) => onChange(e.target.value)}
        value={value}
      >
        {
          options.map((option, index) => {
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            );
          })
        }
      </select>
    </label>
  );
};

type Props = {
  label: string;
  value: string;
  disabled?: boolean;
  options: {
    label: string;
    value: string;
  }[];
  onChange: (value: string) => void;
};

export default Select;

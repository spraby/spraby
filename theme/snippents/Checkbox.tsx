const Checkbox = ({label, onChange = undefined, checked = undefined}: Props) => {
  return (
    <label className="flex gap-2 items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={typeof onChange === 'function' ? (e) => onChange(e.target.checked) : undefined}
        className="relative w-4 h-4
        checked:before:border-gray-600 checked:after:opacity-100
        before:absolute before:rounded before:w-5 before:h-5 before:bg-white before:border before:border-gray-300 before:border-solid before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2
        after:opacity-0 after:transition-opacity after:content-['\2713'] after:absolute after:text-2xl after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2"
      />
      <span className={'truncate'}>{label}</span>
    </label>
  );
};

type Props = {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export default Checkbox;

'use client';

import { useState } from 'react';
import ChevronIcon from "@/theme/assets/ChevronIcon";

const Accordion = ({ label, value }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-between gap-5">
        <span className="w-full whitespace-nowrap">{label}</span>
        <span className="shrink w-full relative before:absolute -before:top-1/2 translate-y-1/2 before:w-full before:h-px before:bg-gray-200"></span>
        <span className={`border border-gray-300 rounded-full p-1 ${!open && 'rotate-180'}`} onClick={() => setOpen((v) => !v)}>
          <ChevronIcon width={20} height={20} />
        </span>
      </div>
      {open && (
        <div>
          {value}
        </div>
      )}
    </div>
  );
};

type Props = {
  label: string;
  value: string;
};

export default Accordion;

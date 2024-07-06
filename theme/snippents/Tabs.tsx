'use client';

import {useState} from 'react';

const Tabs = ({tabs}: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex gap-5 flex-wrap md:flex-nowrap">
        {tabs.map((tab, index) => {
          return (
            <div
              onClick={() => setActiveIndex(index)}
              className={`flex md:justify-between md:w-auto justify-center w-full text-md font-semibold relative text-gray-400 cursor-pointer ${
                activeIndex === index && 'before:absolute before:-bottom-1 before:w-full before:h-1 before:bg-purple-600 text-gray-800'
              }`}
              key={index}
            >
              {tab.label}
            </div>
          );
        })}
      </div>
      <div>
        {tabs.map((tab, index) => {
          return <div
            className={`${activeIndex !== index && 'hidden'} default`}
            key={index}
            dangerouslySetInnerHTML={{__html: tab.value}}
          />
        })}
      </div>
    </div>
  );
};

type Props = {
  tabs: {
    label: string;
    value: string | JSX.Element | JSX.Element[];
  }[];
};

export default Tabs;

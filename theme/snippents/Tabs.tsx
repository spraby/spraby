'use client';

import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';

const COLLAPSED_HEIGHT = 320;

type TabValue = string | JSX.Element | JSX.Element[];

type PreparedTab = {
  label: string;
  value: TabValue;
};

const normalizeTabs = (tabs: Props['tabs']): PreparedTab[] => {
  return tabs.map(tab => ({
    label: tab.label,
    value: typeof tab.value === 'string' ? tab.value.trim() : tab.value,
  }));
};

const Tabs = ({tabs}: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedTabs, setExpandedTabs] = useState<Record<number, boolean>>({});
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const preparedTabs = useMemo(() => normalizeTabs(tabs), [tabs]);

  const measureOverflow = () => {
    const node = contentRef.current;
    if (!node) return;
    const needCollapse = node.scrollHeight > COLLAPSED_HEIGHT + 1;
    setShouldCollapse(needCollapse);
    if (!needCollapse && expandedTabs[activeIndex]) {
      setExpandedTabs(prev => ({
        ...prev,
        [activeIndex]: false,
      }));
    }
  };

  useLayoutEffect(() => {
    measureOverflow();
  }, [activeIndex, preparedTabs, expandedTabs[activeIndex]]);

  useEffect(() => {
    const handleResize = () => measureOverflow();
    if (typeof window === 'undefined') return;
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, preparedTabs, expandedTabs[activeIndex]]);

  const handleTabChange = (index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    setShouldCollapse(false);
  };

  const toggleExpand = () => {
    setExpandedTabs(prev => ({
      ...prev,
      [activeIndex]: !prev[activeIndex],
    }));
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start gap-5 md:flex-nowrap md:justify-between">
        {preparedTabs.map((tab, index) => {
          const isActive = activeIndex === index;

          return (
            <button
              type="button"
              onClick={() => handleTabChange(index)}
              className={`inline-flex items-start justify-center md:flex-1 text-md font-semibold relative text-gray-400 cursor-pointer transition-colors hover:text-gray-700 ${
                isActive && 'before:absolute before:-bottom-1 before:left-0 before:w-full before:h-1 before:rounded-full before:bg-purple-600 text-gray-800 hover:text-gray-800'
              }`}
              key={index}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-6">
        {preparedTabs.map((tab, index) => {
          const isActive = activeIndex === index;
          const isStringContent = typeof tab.value === 'string';
          const isExpanded = !!expandedTabs[index];
          const collapsible = isActive && shouldCollapse;
          const isCollapsed = collapsible && !isExpanded;

          return (
            <div
              key={index}
              className={isActive ? 'flex flex-col gap-4' : 'hidden'}
            >
              <div className="relative">
                {isStringContent ? (
                  <div
                    ref={node => {
                      if (isActive) contentRef.current = node;
                    }}
                    className={`text-sm leading-relaxed text-gray-700 [&>*]:mt-0 [&>*]:mb-0 [&>*+*]:mt-4 ${
                      isCollapsed ? 'max-h-[320px] overflow-hidden' : ''
                    }`}
                    dangerouslySetInnerHTML={{__html: tab.value as string}}
                  />
                ) : (
                  <div
                    ref={node => {
                      if (isActive) contentRef.current = node;
                    }}
                    className={`text-sm leading-relaxed text-gray-700 [&>*]:mt-0 [&>*]:mb-0 [&>*+*]:mt-4 ${
                      isCollapsed ? 'max-h-[320px] overflow-hidden' : ''
                    }`}
                  >
                    {tab.value}
                  </div>
                )}
                {isCollapsed && (
                  <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent" />
                )}
              </div>
              {collapsible && (
                <button
                  type="button"
                  onClick={toggleExpand}
                  className="self-start text-sm font-semibold text-purple-600 transition hover:text-purple-700"
                >
                  {isExpanded ? 'Свернуть текст' : 'Развернуть полностью'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type Props = {
  tabs: {
    label: string;
    value: TabValue;
  }[];
};

export default Tabs;

import React, {useEffect, useRef} from 'react';
import Link from 'next/link';
import {MenuItem} from "@/types";

export default function Menu({menu = [], deep = 1}: { menu: MenuItem[], deep?: number }) {
  return (
    <nav className="sp-menu">
      <List items={menu} deep={deep}/>
    </nav>
  );
}

function List({items = [], deep = 1}: { items: MenuItem[], deep: number }) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ref.current && deep > 1) {
      ref.current.style.height = `calc(${ref.current.scrollHeight}px + 1.5rem)`;
    }
  }, [items]);

  return items.length ? (
    <ul ref={deep > 1 ? ref : null}>
      {
        items.map((item, index) => {
          const hasChildren = Boolean(item.children?.length);
          const isSubLevel = deep > 1;
          const showArrow = hasChildren && deep === 2;
          const linkClassName = isSubLevel
            ? `sp-menu__link${showArrow ? ' sp-menu__link--with-arrow' : ''}`
            : undefined;
          const content = showArrow ? (
            <>
              <span className="sp-menu__link-text">{item.title}</span>
              <ArrowRightIcon className="sp-menu__arrow" aria-hidden={!showArrow} />
            </>
          ) : (
            item.title
          );

          return (
            <li key={`${deep}_${index}`}>
              {item.url?.length ? (
                <Link href={item.url} className={linkClassName}>
                  {content}
                </Link>
              ) : (
                <span className={linkClassName}>
                  {content}
                </span>
              )}
              {hasChildren && <List items={item.children} deep={deep + 1}/>}
            </li>
          );
        })
      }
    </ul>
  ) : null;
}

const ArrowRightIcon = ({className}: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
  </svg>
);

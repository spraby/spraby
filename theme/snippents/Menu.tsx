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
        items.map((i, index) => (
          <li key={`${deep}_${index}`}>
            {i.url?.length ? <Link href={i.url}>{i.title}</Link> : <span>{i.title}</span>}
            {!!i?.children?.length && <List items={i.children} deep={deep + 1}/>}
          </li>
        ))
      }
    </ul>
  ) : null;
}

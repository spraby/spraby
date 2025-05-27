'use client'

import {ReactNode} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";

export default function ({children, menu}: { children: ReactNode, menu: any }) {
  return <div>
    <LayoutHeader menu={menu}/>
    <div className={'bg-yellow-200 rounded-3xl p-5'} onClick={() => {

      if (navigator.share) {
        navigator.share({
          title: 'Смотри, что я нашёл',
          text: 'Полезная ссылка',
          url: 'https://google.com'
        })
          .then(() => console.log('Успешно расшарено'))
          .catch(err => console.error('Ошибка шаринга', err));
      } else {
        alert('Шаринг не поддерживается в этом браузере');
      }
    }}> test </div>
    {children}
  </div>
}

'use client'

import {ReactNode} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";

export default function ({children, menu}: { children: ReactNode, menu: any }) {
  return <div>
    <LayoutHeader menu={menu}/>
    <div className={'flex gap-5'}>
      <div  className={'bg-yellow-200 rounded-3xl p-5'} onClick={() => {
        window.location.href = `tiktok://share?url=${encodeURIComponent('https://google.com')}`;
        setTimeout(() => {
          window.open(`https://www.tiktok.com/share?url=${encodeURIComponent('https://google.com')}`, '_blank');
        }, 1000);
      }} >Tiktok</div>
      <div  className={'bg-yellow-400 rounded-3xl p-5'}  onClick={() => {
        navigator?.share({url: 'https://google.com'}).finally();
      }}>Instagram</div>
      <div  className={'bg-yellow-700 rounded-3xl p-5'} onClick={() => {
        window.location.href = `fb://facewebmodal/f?href=${encodeURIComponent('https://google.com')}`;
      }} >fb</div>
    </div>
    {children}
  </div>
}

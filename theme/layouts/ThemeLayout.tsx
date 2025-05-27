'use client'

import {ReactNode} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";

export default function ({children, menu}: { children: ReactNode, menu: any }) {
  return <div>
    <LayoutHeader menu={menu}/>
    {children}
  </div>
}

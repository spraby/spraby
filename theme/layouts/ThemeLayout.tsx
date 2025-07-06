'use client'

import {ReactNode} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";
import {MenuItem} from "@/types";

export default function ({children, menu}: { children: ReactNode, menu: MenuItem[] }) {
  return <div>
    <LayoutHeader menu={menu}/>
    {children}
  </div>
}

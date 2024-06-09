'use client'

import {ReactNode, useEffect, useState} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";
import {getMainMenu} from "@/services/Settings";

export default function ({children, menu}: { children: ReactNode, menu: any }) {
  // const [menu, setMenu] = useState([]);
  const [opacity, setOpacity] = useState(0)

  // useEffect(() => {
  //   getMainMenu().then(setMenu).finally(() => {
  //     setOpacity(1)
  //   })
  // }, [])

  return <div >
    <LayoutHeader menu={menu}/>
    {children}
  </div>
}

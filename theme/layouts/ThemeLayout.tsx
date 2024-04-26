'use client'

import {ReactNode, useEffect, useState} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";
import {getMainMenu} from "@/services/Settings";

export default function ({children}: { children: ReactNode }) {
  const [menu, setMenu] = useState([]);
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    getMainMenu().then(setMenu)
    setTimeout(() => {
      setOpacity(1)
    }, 300)
  }, [])

  return <div style={{opacity, transition: '1.3s opacity'}}>
    <LayoutHeader menu={menu}/>
    {children}
  </div>
}

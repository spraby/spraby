'use client'

import {ReactNode, useEffect, useState} from "react";
import LayoutHeader from "@/theme/sections/LayoutHeader";

export default function ({children}: { children: ReactNode }) {
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      setOpacity(1)
    }, 300)
  }, [])

  return <div style={{opacity, transition: '1.3s opacity'}}>
    <LayoutHeader/>
    {children}
  </div>
}

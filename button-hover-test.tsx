'use client'

import {Button} from '@nextui-org/react'

export default function ButtonHoverTest() {
  return (
    <div className='p-6'>
      <div className='mb-4'>
        <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600">Default</Button>
      </div>
      <div>
        <Button className="bg-gradient-to-r from-purple-600 to-purple-500 hover:!from-purple-700 hover:!to-purple-600">Forced</Button>
      </div>
    </div>
  )
}

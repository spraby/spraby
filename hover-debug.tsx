'use client'

export default function HoverDebug() {
  return (
    <div className='p-10 space-y-4 bg-gray-100 min-h-screen'>
      <button className='rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-4 px-6 text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600'>Tailwind only</button>
      <button className='rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-4 px-6 text-white shadow-sm transition hover:!from-purple-700 hover:!to-purple-600'>Tailwind forced</button>
      <button className='rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-4 px-6 text-white shadow-sm transition hover:bg-purple-700'>Tailwind bg only</button>
    </div>
  )
}

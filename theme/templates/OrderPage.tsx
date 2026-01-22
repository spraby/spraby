'use client'

import {OrderModel} from "@/prisma/types";
import {useMemo} from "react";

export default function OrderPage({order}: Props) {

  const statuses = useMemo(() => {
    const statusState = getStatusesState(order.status);
    return [
      {
        name: 'Pending',
        isActive: statusState['pending'],
        description: 'Заказ отправлен продавцу'
      },
      {
        name: 'Confirmed',
        isActive: statusState['confirmed'],
        description: 'Заказ подтвержден и ожидает отправки'
      },
      {
        name: 'Processing',
        isActive: statusState['processing'],
        description: 'Заказ отправлен и находится в процессе доставки'
      },
      {
        name: 'Completed',
        isActive: statusState['completed'],
        description: 'Заказ доставлен покупателю'
      },
      {
        name: 'Cancelled',
        isActive: statusState['cancelled'],
        description: 'Заказ закрыт'
      }
    ]
  }, [order]);

  const activeIndex = statuses.reduce((acc, s, idx) => (s.isActive ? idx : acc), -1);

  return (
    <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
      <div className='mx-auto flex w-full max-w-4xl flex-col items-center gap-6'>
        <h1 className='text-center text-2xl font-bold text-gray-900 sm:text-3xl'>
          Отслеживание заказа {order.name}
        </h1>

        <div className='w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
          <div className='flex flex-col gap-6'>
            {/* Mobile vertical timeline */}
            <div className="flex flex-col gap-0 sm:hidden">
              {statuses.map(({name, description, isActive}, index) => {
                const color = isActive ? 'bg-blue-500' : 'bg-gray-300';
                const prevActive = index > 0 ? statuses[index - 1].isActive : false;
                const nextExists = index < statuses.length - 1;
                return (
                  <div key={`status-mobile-${name}`} className="flex items-stretch gap-3 py-0">
                    <div className="flex w-[18px] flex-col items-center">
                      <div className={`w-[3px] flex-1 ${index === 0 ? 'bg-transparent' : prevActive ? 'bg-blue-500' : 'bg-gray-200'}`}/>
                      <div className={`h-[18px] w-[18px] min-h-[18px] min-w-[18px] rounded-full ${color}`}/>
                      <div className={`w-[3px] flex-1 ${!nextExists ? 'bg-transparent' : isActive ? 'bg-blue-500' : 'bg-gray-200'}`}/>
                    </div>
                    <div className="flex-1">
                      <div className='text-base font-semibold text-gray-900'>{name}</div>
                      <p className='text-sm text-gray-500'>{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop horizontal timeline */}
            <div className='hidden sm:flex sm:flex-col sm:gap-6'>
              <div className='flex flex-row items-center justify-between gap-0'>
                {
                  statuses.map(({isActive}, index) => {
                    const color = isActive ? 'bg-blue-500' : 'bg-gray-300';
                    const showFirstHalf = !(index === 0);
                    const showSecondHalf = !(index === statuses.length - 1);
                    return (
                      <div
                        key={`status-node-${index}`}
                        className='flex w-full flex-row items-center justify-center'>
                        <div className={`h-[3px] w-full ${showFirstHalf ? color : 'bg-transparent'}`}/>
                        <div className={`h-[18px] w-[18px] min-h-[18px] min-w-[18px] rounded-full ${color}`}/>
                        <div className={`h-[3px] w-full ${showSecondHalf ? color : 'bg-transparent'}`}/>
                      </div>
                    );
                  })
                }
              </div>
              <div className='flex flex-col gap-4 sm:flex-row sm:justify-between'>
                {
                  statuses.map(status => {
                    return (
                      <div
                        key={status.name}
                        className='flex flex-1 flex-col items-start gap-1 sm:items-center sm:text-center'>
                        <div className='text-base font-semibold text-gray-900'>{status.name}</div>
                        <p className='text-sm text-gray-500'>{status.description}</p>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

type Props = {
  order: OrderModel
}

/**
 *
 * @param orderStatus
 */
function getStatusesState(orderStatus: OrderModel['status']): { [key: string]: boolean } {
  const statuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'archived'];
  let isActive = true;

  return statuses.reduce((acc: { [key: string]: boolean }, i) => {
    acc[i] = isActive;
    if (!(isActive && i !== orderStatus)) isActive = false;
    return acc;
  }, {});
}

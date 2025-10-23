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

  return (
    <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
      <div className='mx-auto flex w-full max-w-4xl flex-col items-center gap-6'>
        <h1 className='text-center text-2xl font-bold text-gray-900 sm:text-3xl'>
          Отслеживание заказа {order.name}
        </h1>

        <div className='w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
          <div className='flex flex-col gap-6 lg:flex-row'>
            <div className='flex flex-col items-center justify-between gap-5 md:h-auto md:w-full md:flex-row lg:flex-col'>
              {
                statuses.map(({isActive}, index) => {
                  const color = isActive ? 'bg-blue-500' : 'bg-gray-300';
                  const showFirstHalf = !(index === 0);
                  const showSecondHalf = !(index === statuses.length - 1);
                  return (
                    <div
                      key={`status-node-${index}`}
                      className='flex h-full w-[15px] flex-col items-center justify-center md:h-auto md:w-full md:flex-row lg:w-[18px]'>
                      <div
                        className={`mb-2 h-1/2 w-[5px] md:mb-0 md:mr-2 md:h-[5px] md:w-1/2 ${showFirstHalf ? color : 'bg-transparent'}`}/>
                      <div className={`h-[15px] w-[15px] min-h-[15px] min-w-[15px] rounded-full ${color}`}/>
                      <div
                        className={`mt-2 h-1/2 w-[5px] md:ml-2 md:mt-0 md:h-[5px] md:w-1/2 ${showSecondHalf ? color : 'bg-transparent'}`}/>
                    </div>
                  );
                })
              }
            </div>
            <div
              className='mt-6 flex flex-col gap-5 md:h-auto md:w-full md:flex-row md:items-start md:justify-between md:gap-6 lg:mt-0'>
              {
                statuses.map(status => {
                  return (
                    <div
                      key={status.name}
                      className='flex min-h-[90px] flex-1 flex-col items-start justify-center gap-2 text-left md:min-h-min md:items-center md:text-center'>
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

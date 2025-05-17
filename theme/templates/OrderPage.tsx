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

  return <main className={'pt-10'}>
    <div className={'container mx-auto flex flex-col gap-5 items-center px-5'}>
      <h1 className={'text-center font-bold text-lg'}>Отслеживание заказа {order.name}</h1>

      <div className={'flex flex-row md:flex-col items-stretch gap-5'}>
        <div className={'flex flex-gap-5 flex-col items-center md:h-auto md:w-full md:flex-row justify-between'}>
          {
            statuses.map(({isActive}, index) => {
              const color = isActive ? 'bg-blue-500' : 'bg-gray-300';
              const showFirstHalf = !(index === 0);
              const showSecondHalf = !(index === statuses.length - 1);
              return <div
                className={`w-[15px] h-full md:h-auto md:w-full flex justify-center items-center flex-col md:flex-row`}>
                <div
                  className={`w-[5px] h-1/2 md:w-1/2 md:h-[5px] mb-2 md:mr-2 md:mb-0 ${showFirstHalf ? color : 'bg-transparent'}`}></div>
                <div className={`w-[15px] min-w-[15px] min-h-[15px] h-[15px] rounded-full ${color}`}/>
                <div
                  className={`w-[5px] h-1/2 md:w-1/2 md:h-[5px] mt-2 md:ml-2 md:mt-0 ${showSecondHalf ? color : 'bg-transparent'}`}></div>
              </div>
            })
          }
        </div>
        <div
          className={'flex flex-gap-5 flex-col items-start md:h-auto md:w-full md:flex-row justify-between'}>
          {
            statuses.map(status => {
              return <div
                className={'pt-5 md:pt-0 flex flex-col items-start md:items-center justify-center min-h-[100px] md:min-h-min flex-1'}>
                <div className={'font-bold'}>{status.name}</div>
                <p className={'text-left md:text-center text-sm text-gray-500'}>{status.description}</p>
              </div>
            })
          }
        </div>
      </div>
    </div>
  </main>
}

type Props = {
  // order: OrderModel
  order: any
}

/**
 *
 * @param orderStatus
 */
// function getStatusesState(orderStatus: OrderModel['status']): { [key: string]: boolean } {
function getStatusesState(orderStatus: any): { [key: string]: boolean } {
  const statuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'archived'];
  let isActive = true;

  return statuses.reduce((acc: { [key: string]: boolean }, i) => {
    acc[i] = isActive;
    if (!(isActive && i !== orderStatus)) isActive = false;
    return acc;
  }, {});
}

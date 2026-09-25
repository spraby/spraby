'use server'
import db from "@/prisma/db.client";
import {isEmploymentType} from "@/lib/employment-types";
import Prisma, {BrandRequestModel} from "@/prisma/types";

export async function findFirst(params?: Prisma.brand_requestsFindFirstArgs): Promise<BrandRequestModel | null> {
  return db.brand_requests.findFirst(params)
}

export async function create(data: Prisma.brand_requestsCreateInput): Promise<BrandRequestModel> {
  return db.brand_requests.create({data})
}

export type CreateBrandRequestInput = {
  email: string;
  phone?: string;
  name?: string;
  brand_name?: string;
  employment_type: string;
}

export async function createRequest(input: CreateBrandRequestInput): Promise<{success: boolean; error?: string}> {
  // Форма занятости обязательна: по ней при одобрении определяется тип аккаунта.
  if (!isEmploymentType(input.employment_type ?? '')) {
    return {success: false, error: 'Выберите форму занятости'}
  }

  try {
    // Check if request with this email already exists and is pending
    const existing = await db.brand_requests.findFirst({
      where: {
        email: input.email,
        status: 'pending'
      }
    })

    if (existing) {
      return {success: false, error: 'Заявка с этим email уже существует и находится на рассмотрении'}
    }

    await db.brand_requests.create({
      data: {
        email: input.email,
        phone: input.phone || null,
        name: input.name || null,
        brand_name: input.brand_name || null,
        employment_type: input.employment_type,
        status: 'pending',
      }
    })

    return {success: true}
  } catch (error) {
    console.error('Error creating brand request:', error)
    return {success: false, error: 'Произошла ошибка при отправке заявки'}
  }
}
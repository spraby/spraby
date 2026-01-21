'use server'
import db from "@/prisma/db.client";
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
}

export async function createRequest(input: CreateBrandRequestInput): Promise<{success: boolean; error?: string}> {
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
        status: 'pending',
      }
    })

    return {success: true}
  } catch (error) {
    console.error('Error creating brand request:', error)
    return {success: false, error: 'Произошла ошибка при отправке заявки'}
  }
}
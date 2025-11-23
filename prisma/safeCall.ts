'use server';

import Prisma from "@/prisma/types";

const isPrismaUnavailableError = (error: unknown) => {
  if (!error) return false;
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001/P1002 – database server not available, P1017 – connection terminated
    return ['P1001', 'P1002', 'P1017'].includes(error.code);
  }
  return false;
};

export const handlePrismaError = <T>(error: unknown, fallback: T, context?: string): T => {
  if (isPrismaUnavailableError(error)) {
    const prefix = context ? `[Prisma:${context}]` : '[Prisma]';
    console.warn(`${prefix} database unavailable – returning fallback result`);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(error);
    }
    return fallback;
  }
  throw error;
};

export const safePrismaCall = async <T>(operation: () => Promise<T>, fallback: T, context?: string): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    return handlePrismaError<T>(error, fallback, context);
  }
};

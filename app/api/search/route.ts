import {NextResponse} from "next/server";
import db from "@/prisma/db.client";

const toNumber = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeLimit = (raw: number) => Math.min(Math.max(raw, 1), 50);

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(toNumber(searchParams.get("page"), 1), 1);
  const limit = normalizeLimit(toNumber(searchParams.get("limit"), 10));
  const sort = searchParams.get("sort") ?? "newest";

  if (!q.length) {
    return NextResponse.json({
      items: [],
      total: 0,
      page,
      pages: 0,
    });
  }

  const where = {
    enabled: true,
    OR: [
      {title: {contains: q, mode: "insensitive" as const}},
      {description: {contains: q, mode: "insensitive" as const}},
    ],
  };

  const orderBy =
    sort === "price_asc"
      ? {final_price: "asc" as const}
      : sort === "price_desc"
        ? {final_price: "desc" as const}
        : sort === "oldest"
          ? {created_at: "asc" as const}
          : {created_at: "desc" as const};

  const [total, products] = await Promise.all([
    db.products.count({where}),
    db.products.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        Brand: true,
        Images: {include: {Image: true}},
      },
    }),
  ]);

  const domain = process.env.AWS_IMAGE_DOMAIN ?? "";

  const items = products.map((product) => {
    const imagePath = product.Images?.[0]?.Image?.src;
    const image = imagePath ? (domain ? `${domain}/${imagePath}` : `/${imagePath}`) : null;

    return {
      id: product.id.toString(),
      title: product.title,
      description: product.description,
      brand: product.Brand?.name ?? null,
      image,
      price: product.price.toString(),
      final_price: product.final_price.toString(),
    };
  });

  return NextResponse.json({
    items,
    total,
    page,
    pages: limit ? Math.ceil(total / limit) : 0,
  });
}

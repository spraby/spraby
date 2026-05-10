'use client'

import Link from "next/link";
import Image from "next/image";
import DoubleSlider from "@/theme/snippents/DoubleSlider";
import Tabs from "@/theme/snippents/Tabs";
import VariantSelector from "@/theme/snippents/VariantSelector";
import {useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject} from "react";
import {ProductModel, ProductCardModel, VariantModel} from "@/prisma/types";
import Drawer from "@/theme/snippents/Drawer";
import {AiOutlineClose} from "react-icons/ai";
import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import {Input, Textarea} from "@nextui-org/input";
import {Accordion, AccordionItem, Snippet} from "@nextui-org/react";
import ChevronIcon from "@/theme/assets/ChevronIcon";
import HeardIcon from "@/theme/assets/HeardIcon";
import Price from "@/theme/snippents/Price";
import {createWithNotifications} from "@/services/Orders";
import {setStatistic} from "@/services/ProductStatistics";
import {differenceInMonths, format} from "date-fns";
import {BreadcrumbItem} from "@/types";
import ProductCart from "@/theme/snippents/ProductCart";
import {Splide, SplideSlide} from "react-splide-ts";
import {useFavorites} from "@/theme/hooks/useFavorites";
import {useCart} from "@/theme/hooks/useCart";
import {calculateDiscountPercent, normalizeImageSrc, toIdString} from "@/services/utilits";
import '@splidejs/react-splide/css';
import {useSearchParams} from "next/navigation";

const ArrowIcon = ({direction}: { direction: 'left' | 'right' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`h-6 w-6 ${direction === 'left' ? 'rotate-180' : ''}`}
    aria-hidden="true"
  >
    <path
      d="M9 5l6 7-6 7"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RECENT_PRODUCTS_STORAGE_KEY = 'spraby_recent_products';
const MAX_RECENT_PRODUCTS = 12;
const MAX_QUICK_ORDER_QUANTITY = 100;

const hasValidPrice = (raw?: string | null) => {
  if (typeof raw !== 'string') return false;
  const trimmed = raw.trim();
  if (!trimmed.length) return false;
  const value = Number(trimmed);
  return Number.isFinite(value);
};

const sanitizeDescription = (value?: string | null) => {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildFavoriteEntryId = (
  productId: string,
  variantId: string | null,
  variantOptions: {label: string; value: string}[]
) => {
  const parts = [productId];
  if (variantId) {
    parts.push(`v:${variantId}`);
  } else if (variantOptions.length) {
    const optionsKey = variantOptions
      .map(opt => `${opt.label}:${opt.value}`)
      .join('|');
    if (optionsKey) parts.push(`o:${optionsKey}`);
  }
  return parts.join('::');
};

const BreadcrumbSeparatorIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mx-1 h-3.5 w-3.5 text-gray-400" aria-hidden="true">
    <path d="M6 3.5L10 8l-4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownMiniIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
    <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 text-gray-400" aria-hidden="true">
    <path d="M8 1.333c2.577 0 4.667 2.09 4.667 4.667 0 3.5-4.667 8.667-4.667 8.667S3.333 9.5 3.333 6c0-2.577 2.09-4.667 4.667-4.667zm0 2.667a2 2 0 100 4 2 2 0 000-4z" fill="currentColor"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 text-gray-400" aria-hidden="true">
    <path d="M5.333 1.333V3M10.667 1.333V3M2.667 5.333h10.666M3.333 3h9.334c.368 0 .666.298.666.667v8.666c0 .368-.298.667-.666.667H3.333a.667.667 0 01-.666-.667V3.667c0-.369.298-.667.666-.667z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const schema = yup
  .object({
    name: yup.string().trim().required('Введите имя'),
    phone: yup.string().trim().required('Добавьте телефон'),
    email: yup.string().trim().email('Проверьте email').required('Укажите email'),
    description: yup.string().trim()
  })
  .required()

const flattenStrings = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap(item => flattenStrings(item));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? [trimmed] : [];
  }
  if (typeof value === 'number') {
    return [String(value)];
  }
  return [];
};

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook'
};

const normalizeSocialUrl = (type: string, raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (type === 'instagram') {
    const username = value.replace(/^@/, '');
    return `https://instagram.com/${username}`;
  }
  if (type === 'telegram') {
    const username = value.replace(/^@/, '');
    return `https://t.me/${username}`;
  }
  if (type === 'whatsapp') {
    const digitsOnly = value.replace(/[^\d]/g, '');
    return digitsOnly.length ? `https://wa.me/${digitsOnly}` : value;
  }
  if (value.includes('.')) {
    const sanitized = value.replace(/^https?:\/\//i, '');
    return `https://${sanitized}`;
  }
  return value;
};

const getSocialDisplayValue = (type: string, raw: string): string => {
  const value = raw.trim();
  if (!value) return '';
  if (type === 'instagram' || type === 'telegram') {
    const username = value.replace(/^@/, '');
    return `@${username}`;
  }
  return value;
};

const normalizePhoneHref = (value: string): string => {
  const clean = value.replace(/[^\d+]/g, '');
  return clean.length ? `tel:${clean}` : `tel:${value}`;
};

const normalizeEmailHref = (value: string): string => `mailto:${value.trim()}`;

type ContactSocial = {
  type: string
  label: string
  value: string
  url: string
  display: string
};

export default function ProductPage({product, informationSettings, breadcrumbs = [], otherProducts = [], brandContacts: brandContactsRaw = [], brandAddresses = []}: Props) {
  const searchParams = useSearchParams();
  const variantIdFromQuery = (searchParams.get('variantId') ?? '').trim() || null;
  const [variant, setVariant] = useState<VariantModel | undefined>(() => {
    if (variantIdFromQuery) {
      const matchedVariant = (product.Variants ?? []).find(item => `${item.id}` === variantIdFromQuery);
      if (matchedVariant) return matchedVariant;
    }
    return (product.Variants ?? [])[0];
  })
  const [open, setOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'order' | 'contacts'>('order');
  const [orderNumber, setOrderNumber] = useState<string>();
  const [submiting, setSubmiting] = useState(false);
  const [quickOrderQuantity, setQuickOrderQuantity] = useState(1);
  const [recentProducts, setRecentProducts] = useState<RelatedProduct[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const {
    toggleFavorite,
    isFavorite: isFavoriteProduct,
    ready: favoritesReady
  } = useFavorites();
  const { addItem, items: cartItems } = useCart();

  const brandDisplayName = useMemo(() => {
    const rawBrandName = typeof product.Brand?.name === 'string' ? product.Brand.name.trim() : '';
    if (rawBrandName.length) return rawBrandName;
    const firstName = typeof product.Brand?.User?.first_name === 'string' ? product.Brand.User.first_name.trim() : '';
    const lastName = typeof product.Brand?.User?.last_name === 'string' ? product.Brand.User.last_name.trim() : '';
    const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
    return combined.length ? combined : null;
  }, [product.Brand?.User?.first_name, product.Brand?.User?.last_name, product.Brand?.name]);

  const galleryImages = useMemo(() => {
    const seen = new Set<string>();

    return (product.Images ?? []).reduce<Array<{
      key: string
      src: string
      productImageId: string
      sourceImageId: string
    }>>((acc, image, index) => {
      const src = normalizeImageSrc(image?.Image?.src);
      if (!src) return acc;

      const productImageId = toIdString(image?.id);
      const sourceImageId = toIdString(image?.image_id);
      const key = productImageId || sourceImageId || `${String(product.id)}-${index}-${src}`;
      if (seen.has(key)) return acc;

      seen.add(key);
      acc.push({
        key,
        src,
        productImageId,
        sourceImageId,
      });

      return acc;
    }, []);
  }, [product.Images, product.id]);

  const galleryImageSources = useMemo(() => galleryImages.map(image => image.src), [galleryImages]);

  const getVariantImageSrc = useCallback((candidate?: VariantModel) => {
    if (!candidate) return null;

    const variantImageId = toIdString(candidate.image_id);
    if (variantImageId.length) {
      const matchedGalleryImage = galleryImages.find(image => {
        return [image.productImageId, image.sourceImageId].filter(Boolean).includes(variantImageId);
      });
      if (matchedGalleryImage?.src) return matchedGalleryImage.src;
    }

    return normalizeImageSrc(candidate.Image?.Image?.src);
  }, [galleryImages]);

  const currentPrice = `${variant?.price ?? product.price ?? 0}`;
  const currentFinalPrice = `${variant?.final_price ?? product.final_price ?? currentPrice}`;
  const discountPercent = calculateDiscountPercent(Number(currentPrice), Number(currentFinalPrice));
  const hasDiscount = discountPercent > 0;
  const quickOrderTotalFinalPrice = Number(currentFinalPrice) * quickOrderQuantity;

  const handleDrawerClose = () => {
    setOpen(false);
    setOrderNumber(undefined);
    setDrawerMode('order');
    setQuickOrderQuantity(1);
  };

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    setStatistic(product.id, 'view').then();
  }, [product.id]);

  /**
   *
   */
  const orderLink = useMemo(() => {
    if (!orderNumber) return null;
    return `${window.location.origin}/purchases/${orderNumber.replace('#', '')}`;
  }, [orderNumber])

  const options = useMemo(() => {
    if (product && product?.Category && product?.Variants?.length) {
      return product.Category.CategoryOption?.reduce((acc: Options[], categoryOption) => {
        if (!categoryOption.Option) return acc;

        const optionVariantValues = (product?.Variants ?? []).reduce((acc: string[], variant) => {
          (variant.VariantValue ?? []).map(variantValue => {
            if (variantValue.option_id === categoryOption.option_id && variantValue.Value?.value && !acc.includes(variantValue.Value.value)) acc.push(variantValue.Value.value);
          });
          return acc;
        }, []);

        const sortedOptionVariantValues: string[] = [];
        [...(categoryOption.Option.Values ?? [])].sort((a, b) => a.position - b.position).forEach(i => {
          const o = optionVariantValues.find(j => j === i.value);
          if (o) sortedOptionVariantValues.push(o);
        });

        if (optionVariantValues?.length) acc.push({
          id: categoryOption.Option.id,
          label: categoryOption.Option.title,
          options: sortedOptionVariantValues.map(i => ({label: i, value: i}))
        })

        return acc;
      }, []);
    }

    return [];
  }, [product]);

  const tags = useMemo(() => {
    const unique = new Set<string>();
    if (product.Category?.title) unique.add(product.Category.title);
    if (product.Brand?.name) unique.add(product.Brand.name);
    options?.forEach(option => {
      option.options.forEach(item => {
        if (item.label) unique.add(item.label);
      });
    });
    return Array.from(unique);
  }, [options, product]);
  const [showAllTags, setShowAllTags] = useState(false);
  const COLLAPSED_TAG_COUNT = 8;
  const visibleTags = useMemo(
    () => (showAllTags ? tags : tags.slice(0, COLLAPSED_TAG_COUNT)),
    [showAllTags, tags]
  );
  useEffect(() => {
    setShowAllTags(false);
  }, [product.id]);

  const shippingMethods = useMemo(() => {
    return (product.Brand?.brand_shipping_method ?? [])
      .map((bsm: any) => bsm.shipping_methods)
      .filter(Boolean);
  }, [product]);

  const deliveryContent = useMemo(() => {
    if (!shippingMethods.length) return '';
    return (
      <div className="flex flex-col gap-3">
        {shippingMethods.map((method: any) => (
          <div key={method.id ?? method.key} className="flex flex-col gap-1 rounded-xl border border-gray-200 px-4 py-3">
            <span className="text-sm font-semibold text-gray-800">{method.name}</span>
            {method.description && (
              <span className="text-xs text-gray-500">{method.description}</span>
            )}
          </div>
        ))}
      </div>
    );
  }, [shippingMethods]);

  const refund = useMemo(() => {
    return product.Brand?.refund_policy ?? '';
  }, [product]);

  const productTabs = useMemo(() => ([
    {
      label: 'Описание',
      value: product.description ?? ''
    },
    {
      label: 'Способы доставки',
      value: deliveryContent
    },
    {
      label: 'Условия возврата',
      value: refund
    },
  ]), [deliveryContent, product.description, refund]);

  const brandLocation = useMemo(() => {
    const addr = brandAddresses?.[0];
    if (!addr) return null;
    const parts = [addr.city, addr.province, addr.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }, [brandAddresses]);

  const pluralize = (value: number, forms: [string, string, string]) => {
    const n = Math.abs(value) % 100;
    const n1 = n % 10;
    if (n > 10 && n < 20) return forms[2];
    if (n1 > 1 && n1 < 5) return forms[1];
    if (n1 === 1) return forms[0];
    return forms[2];
  };

  const brandSinceText = useMemo(() => {
    const createdValue = (product.Brand as any)?.created_at ?? (product.Brand as any)?.createdAt;
    if (!createdValue) return null;
    const createdDate = new Date(createdValue);
    if (Number.isNaN(createdDate.getTime())) return null;
    const months = differenceInMonths(new Date(), createdDate);
    if (months <= 0) return 'На Spraby менее месяца';
    if (months < 12) {
      return `На Spraby ${months} ${pluralize(months, ['месяц', 'месяца', 'месяцев'])}`;
    }
    const years = Math.floor(months / 12);
    const restMonths = months % 12;
    let result = `На Spraby ${years} ${pluralize(years, ['год', 'года', 'лет'])}`;
    if (restMonths > 0) {
      result += ` ${restMonths} ${pluralize(restMonths, ['месяц', 'месяца', 'месяцев'])}`;
    }
    return result;
  }, [product]);

  const brandContacts = useMemo(() => {
    const contacts = brandContactsRaw ?? [];
    const phones = contacts.filter(c => c.type === 'phone').map(c => c.value);
    const emails = contacts.filter(c => c.type === 'email').map(c => c.value);
    const socialTypes = ['whatsapp', 'telegram', 'instagram', 'facebook'];
    const socials: ContactSocial[] = contacts
      .filter(c => socialTypes.includes(c.type))
      .map(c => {
        const label = SOCIAL_LABELS[c.type] ?? c.type;
        const url = normalizeSocialUrl(c.type, c.value);
        const display = getSocialDisplayValue(c.type, c.value) || c.value;
        return { type: c.type, label, value: c.value, url, display };
      });

    return {
      phones,
      emails,
      socials,
      hasAny: Boolean(phones.length || emails.length || socials.length)
    };
  }, [brandContactsRaw]);

  const variantDetails = useMemo(() => {
    const details = (variant?.VariantValue ?? []).map(i => {
      const optionTitle = i?.Value?.Option?.title;
      const optionValue = i?.Value?.value;
      if (!optionTitle || !optionValue) return null;
      return {
        label: optionTitle.trim(),
        value: optionValue.trim()
      };
    }).filter(Boolean) as { label: string, value: string }[];

    return details.sort((a, b) => a.label.localeCompare(b.label));
  }, [variant]);

  // Генерируем уникальный ID для корзины на основе товара и всех его опций
  const cartItemId = useMemo(() => {
    if (!variant) return null;

    // Создаем хэш из всех опций для уникальности
    const optionsHash = variantDetails
      .map(detail => `${detail.label}:${detail.value}`)
      .join('|');

    // Простая хэш-функция для работы с любыми символами (включая кириллицу)
    let hash = 0;
    for (let i = 0; i < optionsHash.length; i++) {
      const char = optionsHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hashString = Math.abs(hash).toString(36);

    // Формат: productId-variantId-hash
    return `${product.id}-${variant.id}-${hashString}`;
  }, [product.id, variant, variantDetails]);

  const variantSummary = useMemo(() => {
    return variantDetails.map(detail => `${detail.label}: ${detail.value}`).join(', ');
  }, [variantDetails]);

  // Количество товара в корзине с текущим набором опций
  const itemInCartQuantity = useMemo(() => {
    if (!cartItemId) return 0;
    const cartItem = cartItems.find(item => item.id === cartItemId);
    return cartItem?.quantity ?? 0;
  }, [cartItemId, cartItems]);

  const handleImageChange = useCallback((_imageSrc: string, index: number) => {
    const galleryImage = galleryImages[index];
    if (!galleryImage) return;

    const imageIds = [galleryImage.productImageId, galleryImage.sourceImageId].filter(Boolean);
    if (!imageIds.length) return;

    const matchedVariant = (product.Variants ?? []).find(item => {
      const variantImageId = toIdString(item.image_id);
      return variantImageId.length ? imageIds.includes(variantImageId) : false;
    });

    if (matchedVariant) {
      setVariant(prev => `${prev?.id ?? ''}` === `${matchedVariant.id}` ? prev : matchedVariant);
    }
  }, [galleryImages, product.Variants]);

  const handleVariantChange = useCallback((nextVariant?: VariantModel) => {
    setVariant(prev => {
      if (`${prev?.id ?? ''}` === `${nextVariant?.id ?? ''}`) return prev;
      return nextVariant;
    });
  }, []);

  const startImage = useMemo(() => getVariantImageSrc(variant), [getVariantImageSrc, variant]);

  const productPreviewImage = useMemo(() => {
    const currentVariantImage = getVariantImageSrc(variant);
    if (currentVariantImage) return currentVariantImage;

    const galleryImage = galleryImages[0]?.src;
    if (galleryImage) return galleryImage;

    return getVariantImageSrc((product.Variants ?? [])[0]);
  }, [galleryImages, getVariantImageSrc, product.Variants, variant]);

  const sliderImages = useMemo(() => {
    if (galleryImageSources.length) return galleryImageSources;
    return productPreviewImage ? [productPreviewImage] : [];
  }, [galleryImageSources, productPreviewImage]);

  const otherProductsToDisplay = useMemo(() => {
    return (otherProducts ?? []).filter(item => item.Images?.some(image => image?.Image?.src));
  }, [otherProducts]);

  const sellerName = useMemo(() => {
    const brandName = typeof product.Brand?.name === 'string' ? product.Brand.name.trim() : '';
    if (brandName.length) return brandName;
    const user = product.Brand?.User as Record<string, unknown> | undefined;
    if (user) {
      const candidate = user['firstName'] ?? user['first_name'];
      if (typeof candidate === 'string') {
        const normalized = candidate.trim();
        if (normalized.length) return normalized;
      }
    }
    return '';
  }, [product]);

  const sellerInitials = useMemo(() => {
    return sellerName.length ? sellerName.slice(0, 2).toUpperCase() : 'S';
  }, [sellerName]);

  const primaryImageSrc = useMemo(() => {
    const imageFromGallery = galleryImages[0]?.src;
    if (imageFromGallery) return imageFromGallery;
    return productPreviewImage ?? '';
  }, [galleryImages, productPreviewImage]);

  const favoriteProductData = useMemo(() => {
    const productId = toIdString(product.id);
    if (!productId) return null;
    const title = typeof product.title === 'string' ? product.title.trim() : '';
    const rawFinalPrice = `${currentFinalPrice ?? ''}`.trim();
    const rawPrice = `${currentPrice ?? ''}`.trim();
    const finalPrice = rawFinalPrice.length ? rawFinalPrice : rawPrice;
    if (!title.length || !finalPrice.length) return null;
    const imageCandidate = productPreviewImage ?? primaryImageSrc ?? null;
    const descriptionText = sanitizeDescription(product.description);
    const variantId = variant ? toIdString(variant.id) : '';
    const variantTitle = variantSummary.trim();
    const entryId = buildFavoriteEntryId(productId, variantId || null, variantDetails);
    return {
      id: entryId,
      productId,
      title,
      finalPrice,
      price: rawPrice.length ? rawPrice : null,
      image: imageCandidate,
      brand: brandDisplayName ?? null,
      productUrl: `/products/${productId}`,
      description: descriptionText || null,
      variantId: variantId || null,
      variantTitle: variantTitle.length ? variantTitle : null,
      variantOptions: variantDetails,
    };
  }, [brandDisplayName, currentFinalPrice, currentPrice, primaryImageSrc, product.description, product.id, product.title, productPreviewImage, variant, variantDetails, variantSummary]);

  const isInFavorites = useMemo(() => {
    if (!favoriteProductData) return false;
    return isFavoriteProduct(favoriteProductData.id);
  }, [favoriteProductData, isFavoriteProduct]);

  const favoriteButtonLabel = isInFavorites ? 'Убрать из избранного' : 'Добавить в избранное';
  const favoriteButtonDisabled = !favoriteProductData || !favoritesReady;

  const handleToggleFavorite = useCallback(() => {
    if (!favoriteProductData) return;
    toggleFavorite(favoriteProductData);
  }, [favoriteProductData, toggleFavorite]);

  const toRelatedRecentProduct = useCallback((item: RecentProductStorage): RelatedProduct | null => {
    if (!item?.id || !item.title) return null;
    if (!item.image) return null;
    if (!hasValidPrice(item.final_price)) return null;
    const normalizedSrc = normalizeImageSrc(item.image);
    if (!normalizedSrc) return null;
    const priceValue = hasValidPrice(item.price) ? item.price : item.final_price;
    const normalizedBrand = typeof item.brand === 'string' ? item.brand.trim() : '';
    return {
      id: item.id,
      title: item.title,
      price: priceValue,
      final_price: item.final_price,
      Images: [{Image: {src: normalizedSrc}}],
      ...(normalizedBrand.length ? {
        Brand: {
          name: normalizedBrand
        }
      } : {})
    } as unknown as RelatedProduct;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) : [];
      const entries: RecentProductStorage[] = Array.isArray(stored) ? stored.filter(Boolean) : [];
      const currentId = String(product.id);
      const filtered = entries.filter(item => item?.id && item.id !== currentId && item.image && hasValidPrice(item.final_price));

      const finalPriceString = `${currentFinalPrice ?? ''}`;
      const priceString = `${currentPrice ?? ''}`;

      const currentEntry: RecentProductStorage | null = (product?.title && primaryImageSrc && hasValidPrice(finalPriceString)) ? {
        id: currentId,
        title: product.title,
        price: hasValidPrice(priceString) ? priceString : finalPriceString,
        final_price: finalPriceString,
        image: primaryImageSrc,
        brand: brandDisplayName ?? null
      } : null;

      const nextEntries = (currentEntry ? [currentEntry, ...filtered] : filtered).slice(0, MAX_RECENT_PRODUCTS);
      const dedupedEntries: RecentProductStorage[] = [];
      const seenIds = new Set<string>();
      nextEntries.forEach(entry => {
        if (!entry?.id) return;
        if (seenIds.has(entry.id)) return;
        seenIds.add(entry.id);
        dedupedEntries.push(entry);
      });
      window.localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, JSON.stringify(dedupedEntries));
      const viewable = dedupedEntries.filter(item => item.id !== currentId && item.image && hasValidPrice(item.final_price));
      const normalized = viewable
        .map(toRelatedRecentProduct)
        .filter((item): item is RelatedProduct => item !== null);
      setRecentProducts(normalized);
    } catch (error) {
      console.error('Failed to update recent products', error);
    }
  }, [brandDisplayName, currentFinalPrice, currentPrice, primaryImageSrc, product.id, product.title, toRelatedRecentProduct]);

  const createCarouselLayout = useCallback((total: number, minimums: CarouselMinimums = {}): CarouselLayout => {
    const targetDesktop = Math.max(1, minimums.desktop ?? 5);
    const targetLarge = Math.max(1, minimums.large ?? 3);
    const targetTablet = Math.max(1, minimums.tablet ?? 2);
    const targetMobile = Math.max(1, minimums.mobile ?? 2);

    const safeTotal = Math.max(0, total);
    const autoWidth = safeTotal > 0 && safeTotal < targetDesktop;

    const desktopPerPage = autoWidth ? Math.max(1, safeTotal) : targetDesktop;
    const largePerPage = autoWidth ? Math.max(1, Math.min(safeTotal, targetLarge)) : targetLarge;
    const tabletPerPage = autoWidth ? Math.max(1, Math.min(safeTotal, targetTablet)) : targetTablet;
    const mobilePerPage = autoWidth ? Math.max(1, Math.min(safeTotal, targetMobile)) : targetMobile;

    const minVisible = Math.min(desktopPerPage, largePerPage, tabletPerPage, mobilePerPage);

    return {
      perPage: Math.max(1, Math.min(desktopPerPage, 5)),
      breakpoints: {
        1440: {perPage: Math.max(1, Math.min(desktopPerPage, 5))},
        1100: {perPage: Math.max(1, Math.min(largePerPage, 3)), gap: '1.25rem'},
        768: {perPage: Math.max(1, Math.min(tabletPerPage, 2)), gap: '1rem'},
        520: {perPage: Math.max(1, Math.min(mobilePerPage, 2)), gap: '0.75rem'},
      },
      canScroll: safeTotal > Math.max(1, Math.min(desktopPerPage, 5)),
      canDrag: autoWidth ? safeTotal > 1 : safeTotal > minVisible,
      autoWidth
    };
  }, []);

  const relatedLayout = useMemo(
    () => createCarouselLayout(otherProductsToDisplay.length, {desktop: 5, large: 3, tablet: 2, mobile: 2}),
    [createCarouselLayout, otherProductsToDisplay.length]
  );

  const recentLayout = useMemo(
    () => createCarouselLayout(recentProducts.length, {desktop: 5, large: 3, tablet: 2, mobile: 2}),
    [createCarouselLayout, recentProducts.length]
  );

  const relatedCarouselRef = useRef<InstanceType<typeof Splide> | null>(null);
  const handleRelatedPrev = useCallback(() => {
    relatedCarouselRef.current?.go('<');
  }, []);
  const handleRelatedNext = useCallback(() => {
    relatedCarouselRef.current?.go('>');
  }, []);

  const recentCarouselRef = useRef<InstanceType<typeof Splide> | null>(null);
  const handleRecentPrev = useCallback(() => {
    recentCarouselRef.current?.go('<');
  }, []);
  const handleRecentNext = useCallback(() => {
    recentCarouselRef.current?.go('>');
  }, []);

  const renderProductCarousel = ({
    title,
    subtitle,
    products,
    carouselRef,
    onPrev,
    onNext,
    layout,
    groupSuffix,
    slideKeyPrefix,
    ariaLabel
  }: RenderCarouselConfig) => {
    if (!products.length) return null;
    const canDrag = layout.canDrag;
    const slideClassName = layout.autoWidth ? 'w-auto !basis-auto flex justify-start' : '';
    const cardWrapperClass = layout.autoWidth
      ? 'w-[clamp(10.25rem,16vw,12.75rem)] max-w-[12.75rem] shrink-0'
      : 'w-full';
    const containerPaddingClass = layout.autoWidth ? 'px-2 sm:px-4 lg:px-6' : 'px-2 sm:px-4 lg:px-6';
    return (
      <section className='flex flex-col gap-5 pt-4 lg:pt-6'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-semibold text-gray-900'>{title}</h2>
          {subtitle && <span className='text-sm text-gray-500'>{subtitle}</span>}
        </div>
        <div className='relative'>
          <Splide
            ref={carouselRef}
            options={{
              perPage: layout.perPage,
              perMove: 1,
              gap: '1.5rem',
              rewind: layout.canScroll,
              pagination: false,
              drag: canDrag ? 'free' : false,
              arrows: false,
              speed: 600,
              easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
              breakpoints: layout.breakpoints,
              autoWidth: layout.autoWidth,
              focus: layout.autoWidth ? 0 : undefined,
              trimSpace: false,
              padding: layout.autoWidth ? '0 0.75rem' : undefined
            }}
            aria-label={ariaLabel}
            className={`group/${groupSuffix} ${containerPaddingClass}`}
          >
            {products.map(item => (
              <SplideSlide key={`${slideKeyPrefix}-${String(item.id)}`} className={slideClassName}>
                <div className={cardWrapperClass}>
                  <ProductCart product={item}/>
                </div>
              </SplideSlide>
            ))}
          </Splide>
          <button
            type='button'
            onClick={onPrev}
            aria-label={`Предыдущие элементы раздела ${title}`}
            className={`absolute left-0 top-[38%] -translate-y-1/2 -translate-x-1/2 sm:-translate-x-2 inline-flex h-12 w-12 items-center justify-center text-gray-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${layout.canScroll ? 'pointer-events-auto hover:text-purple-600' : 'opacity-30 pointer-events-none'}`}
            disabled={!layout.canScroll}
            tabIndex={layout.canScroll ? 0 : -1}
            aria-hidden={!layout.canScroll}
          >
            <ArrowIcon direction='left'/>
          </button>
          <button
            type='button'
            onClick={onNext}
            aria-label={`Следующие элементы раздела ${title}`}
            className={`absolute right-0 top-[38%] -translate-y-1/2 translate-x-1/2 sm:translate-x-2 inline-flex h-12 w-12 items-center justify-center text-gray-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 ${layout.canScroll ? 'pointer-events-auto hover:text-purple-600' : 'opacity-30 pointer-events-none'}`}
            disabled={!layout.canScroll}
            tabIndex={layout.canScroll ? 0 : -1}
            aria-hidden={!layout.canScroll}
          >
            <ArrowIcon direction='right'/>
          </button>
        </div>
      </section>
    );
  };

  const compactInputClassNames = useMemo(() => ({
    input: "text-sm",
    label: "text-xs font-medium text-gray-500"
  }), []);

  const orderFormMarkup = <form className={'relative flex h-full max-h-[100vh] min-h-0 flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6'}
                                onSubmit={
                                  handleSubmit((data) => {
                                    if (variant && product) {
                                      setSubmiting(true);
                                      createWithNotifications({
                                        data: {
                                          name: `#${format(new Date(), 'yyMMdd-HHmmssSSS')}`,
                                          Customer: {
                                            connectOrCreate: {
                                              where: {
                                                email: data.email
                                              },
                                              create: {
                                                email: data.email,
                                                name: data.name,
                                                phone: `${data.phone}`
                                              }
                                            }
                                          },
                                          Brand: {
                                            connect: {
                                              id: product.brand_id
                                            }
                                          },
                                          OrderItems: {
                                            createMany: {
                                              data: {
                                                price: currentPrice,
                                                final_price: currentFinalPrice,
                                                image_id: variant?.image_id,
                                                product_id: product.id,
                                                variant_id: variant.id,
                                                quantity: quickOrderQuantity,
                                                title: product.title,
                                                variant_title: variantSummary
                                              }
                                            }
                                          },
                                          OrderShippings: {
                                            createMany: {
                                              data: {
                                                name: data.name,
                                                phone: `${data.phone}`,
                                                note: data?.description ?? ''
                                              }
                                            }
                                          }
                                        }
                                      }).then(order => {
                                        if (order.name) setOrderNumber(order.name);
                                      }).finally(() => setSubmiting(false));
                                    }
                                  })
                                }>
    <div className="flex items-start justify-between px-1 pt-1">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-wide sm:text-xl">Заказ товара</h3>
        <p className="text-xs text-gray-500 sm:text-sm">Заполните данные, и мы свяжемся с вами</p>
      </div>
      <button
        type="button"
        onClick={handleDrawerClose}
        aria-label="Закрыть окно заказа"
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
      >
        <AiOutlineClose className="h-5 w-5"/>
      </button>
    </div>
    <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pb-3 sm:pb-2">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Данные покупателя</span>
        <Input
          {...register("name")}
          disabled={submiting}
          variant="bordered"
          label="Name"
          size="sm"
          errorMessage={errors.name?.message}
          isInvalid={!!errors.name?.message?.length}
          classNames={compactInputClassNames}
        />
        <Input
          {...register("phone")}
          disabled={submiting}
          variant="bordered"
          label="Phone"
          size="sm"
          errorMessage={errors.phone?.message}
          isInvalid={!!errors.phone?.message?.length}
          classNames={compactInputClassNames}
        />
        <Input
          {...register("email")}
          disabled={submiting}
          variant="bordered"
          label="Email"
          size="sm"
          errorMessage={errors.email?.message}
          isInvalid={!!errors.email?.message?.length}
          classNames={compactInputClassNames}
        />
        <Textarea
          {...register('description')}
          disabled={submiting}
          label="Комментарий к заказу"
          variant="bordered"
          size="sm"
          minRows={2}
          classNames={compactInputClassNames}
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-100 sm:h-[80px] sm:w-[80px]">
            {productPreviewImage ? (
              <Image
                src={productPreviewImage}
                alt={product.title}
                fill
                sizes="80px"
                className="object-cover object-center transition-transform duration-300"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[0.65rem] font-semibold text-gray-400">
                Нет фото
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 text-sm sm:text-base">
            <span className="text-sm font-semibold leading-tight text-gray-900 sm:text-base">{product.title}</span>
            {variantDetails.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {variantDetails.map(({label, value}) => (
                  <span
                    key={`${label}-${value}`}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[0.68rem] font-medium text-gray-700 ring-1 ring-gray-200 sm:text-xs"
                  >
                    <span className="uppercase tracking-wide text-[0.55rem] text-gray-400">{label}</span>
                    <span className="text-gray-900">{value}</span>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500 sm:text-sm">Параметры не выбраны</span>
            )}
          </div>
        </div>
        <div className="h-px bg-gray-100"></div>
        <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-gray-500 sm:text-sm">
          <span>Стоимость</span>
          <span className="flex items-center gap-2">
            <Price finalPrice={+currentFinalPrice} price={+currentPrice} size="lg"/>
            {hasDiscount && (
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-600 sm:text-xs">
                -{discountPercent}%
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-wide text-gray-500 sm:text-sm">
          <span>Количество</span>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white normal-case tracking-normal">
            <button
              type="button"
              onClick={() => setQuickOrderQuantity(prev => Math.max(1, prev - 1))}
              disabled={submiting || quickOrderQuantity <= 1}
              aria-label="Уменьшить количество"
              className="px-3 py-1 text-gray-600 transition hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-medium text-gray-900">
              {quickOrderQuantity}
            </span>
            <button
              type="button"
              onClick={() => setQuickOrderQuantity(prev => Math.min(MAX_QUICK_ORDER_QUANTITY, prev + 1))}
              disabled={submiting || quickOrderQuantity >= MAX_QUICK_ORDER_QUANTITY}
              aria-label="Увеличить количество"
              className="px-3 py-1 text-gray-600 transition hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-gray-900 sm:text-lg">
          <span>Итого</span>
          <span className="flex items-baseline gap-1.5 sm:gap-2 text-purple-600">
            <Price
              finalPrice={quickOrderTotalFinalPrice}
              size="lg"
            />
          </span>
        </div>
      </div>
    </div>
    <div className="flex flex-row gap-3 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type="submit"
        disabled={submiting}
        className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-700 hover:to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submiting ? 'Отправляем...' : 'Оформить'}
      </button>
      <button
        type="button"
        onClick={handleDrawerClose}
        className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100"
      >
        Отмена
      </button>
    </div>
  </form>;

  const thankYouMarkup = <div className={'relative flex h-screen flex-col gap-6 p-5 sm:p-6'}>
    <div className="flex items-start justify-between px-1 pt-1">
      <h3 className="text-lg font-semibold tracking-wide text-gray-900 sm:text-xl">Заказ оформлен</h3>
      <button
        type="button"
        onClick={handleDrawerClose}
        aria-label="Закрыть окно заказа"
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
      >
        <AiOutlineClose className="h-5 w-5"/>
      </button>
    </div>
    <div className="mx-auto max-w-md text-center text-sm text-gray-700 sm:text-base">
      <span className="mt-2 block text-base font-semibold text-gray-900 sm:text-lg">Спасибо 🖤</span>
      <p className="mt-3">Заказ № {orderNumber} успешно отправлен!</p>
      <p className="mt-3">
        Ожидайте, представитель &quot;{product?.Brand?.name ?? 'брэнда'}&quot; свяжется с вами для подтверждения заказа.
      </p>
      {
        orderLink && <>
          <p className="mt-4">Вот ссылка для отслеживания статуса заказа</p>
          <Snippet hideSymbol size="sm" className="mt-2">
            <a href={orderLink} className={'text-purple-700 hover:underline'}>{orderLink}</a>
          </Snippet>
        </>
      }
    </div>
  </div>

  const contactMarkup = <div className={'relative flex h-full max-h-[100vh] min-h-0 flex-col gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6'}>
    <div className="flex items-start justify-between px-1 pt-1">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold tracking-wide sm:text-xl">Контакты продавца</h3>
        <p className="text-xs text-gray-500 sm:text-sm">
          Свяжитесь {product.Brand?.name ? `с ${product.Brand.name}` : 'с продавцом'} удобным способом
        </p>
      </div>
      <button
        type="button"
        onClick={handleDrawerClose}
        aria-label="Закрыть окно контактов"
        className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
      >
        <AiOutlineClose className="h-5 w-5"/>
      </button>
    </div>
    <div className="flex flex-1 min-h-0 flex-col gap-6 overflow-y-auto pb-3 sm:pb-2">
      {brandContacts.hasAny ? (
        <>
          {brandContacts.phones.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Телефон</span>
              <div className="flex flex-col gap-2">
                {brandContacts.phones.map(phone => (
                  <a
                    key={phone}
                    href={normalizePhoneHref(phone)}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span>{phone}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {brandContacts.emails.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Email</span>
              <div className="flex flex-col gap-2">
                {brandContacts.emails.map(email => (
                  <a
                    key={email}
                    href={normalizeEmailHref(email)}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span>{email}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {brandContacts.socials.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 sm:text-sm">Социальные сети</span>
              <div className="flex flex-col gap-2">
                {brandContacts.socials.map(social => (
                  <a
                    key={`${social.type}-${social.value}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <span className="text-[0.68rem] uppercase tracking-wide text-gray-400">{social.label}</span>
                    <span className="text-base text-purple-600">{social.display || social.value}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Контактные данные продавца появятся здесь, как только он их добавит.
        </div>
      )}
    </div>
    <div className="pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={handleDrawerClose}
        className="w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100"
      >
        Закрыть
      </button>
    </div>
  </div>

  return !!product && <main className='px-4 pt-6 pb-12 sm:px-6 lg:px-8'>
    <div className='mx-auto flex max-w-6xl flex-col gap-4 lg:gap-8'>
      {breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 no-scrollbar">
          <ol className="flex items-center gap-1.5 whitespace-nowrap pr-5 pe-8 text-sm font-medium text-gray-500 lg:pr-0 lg:pe-0">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.title}-${index}`} className="flex items-center">
                {crumb.url && index !== breadcrumbs.length - 1 ? (
                  <>
                    <Link href={crumb.url} className="inline-flex items-center gap-1 text-gray-600 transition hover:text-purple-600">
                      {crumb.title}
                    </Link>
                    <BreadcrumbSeparatorIcon/>
                  </>
                ) : (
                  <span className="text-gray-800 font-semibold">{crumb.title}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className='flex w-full flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-10'>
        <div className='order-1 lg:order-1 flex flex-col gap-7 lg:col-span-7 xl:col-span-7'>
          <div className='relative'>
            <DoubleSlider images={sliderImages} startImage={startImage} onImageChange={handleImageChange}/>
            {hasDiscount && discountPercent > 0 && (
              <span className='absolute right-4 top-4 inline-flex items-center rounded-lg bg-purple-500 px-3 py-1.5 text-sm font-semibold text-white shadow-md'>
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className='hidden lg:flex flex-col gap-7'>
            <Tabs tabs={productTabs}/>
            <div className='h-px bg-gray-200'></div>
          </div>
        </div>
        <div className='order-2 lg:order-2 flex flex-col gap-7 lg:col-span-5 xl:col-span-5'>
          <div className='flex items-start justify-between gap-4'>
            <h2 className='text-2xl font-semibold text-gray-900 sm:text-3xl'>{product.title}</h2>
            <button
              type='button'
              onClick={handleToggleFavorite}
              disabled={favoriteButtonDisabled}
              aria-label={favoriteButtonLabel}
              aria-pressed={isInFavorites}
              title={favoriteButtonLabel}
              className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60'
            >
              <HeardIcon color={isInFavorites ? '#db2777' : '#272738'} filled={isInFavorites}/>
            </button>
          </div>
          <Price finalPrice={+currentFinalPrice} price={+currentPrice} finalPriceClassName="text-gray-900"/>
          {tags.length > 0 && (
            <div className='flex flex-col gap-2'>
              <div className='flex flex-wrap gap-2'>
                {visibleTags.map((tag) => (
                  <span key={tag} className='inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-gray-600'>
                    {tag}
                  </span>
                ))}
              </div>
              {tags.length > COLLAPSED_TAG_COUNT && (
                <button
                  type='button'
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className='self-end text-xs font-semibold text-purple-600 transition hover:text-purple-700'
                >
                  {showAllTags ? 'Скрыть теги' : `Показать все (${tags.length})`}
                </button>
              )}
            </div>
          )}

          <div className='flex flex-col gap-3'>
            <div className='grid grid-cols-2 gap-3'>
              <button
                disabled={!variant}
                onClick={() => {
                  if (!variant) return;
                  setDrawerMode('order');
                  setOrderNumber(undefined);
                  setQuickOrderQuantity(1);
                  setOpen(true);
                }}
                className={`w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:!from-purple-700 hover:!to-purple-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                Быстрый заказ
              </button>
              <button
                disabled={!variant}
                onClick={() => {
                  if (!variant || !cartItemId) return;
                  addItem({
                    id: cartItemId,
                    productId: String(product.id),
                    variantId: String(variant.id),
                    brandId: String(product.brand_id),
                    brandName: brandDisplayName || 'Продавец',
                    title: product.title,
                    variantTitle: variantSummary,
                    image: productPreviewImage,
                    price: currentPrice,
                    finalPrice: currentFinalPrice,
                  });
                  setStatistic(product.id, 'add_to_cart').then();

                  // Показываем успешное добавление
                  setAddedToCart(true);
                  setTimeout(() => setAddedToCart(false), 2000);
                }}
                className="w-full rounded-xl border border-purple-600 py-3 text-sm font-semibold text-purple-600 shadow-sm transition hover:bg-purple-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {addedToCart ? (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-500">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      Добавлен в корзину
                    </>
                  ) : (
                    <>
                      {itemInCartQuantity > 0 ? `В корзине (${itemInCartQuantity})` : 'В корзину'}
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Способы доставки */}
            {shippingMethods.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {shippingMethods.map((method: any) => (
                  <div key={method.id ?? method.key} className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-700">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium">{method.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <VariantSelector
            variants={product?.Variants ?? []}
            options={options}
            selectedVariantId={variant ? toIdString(variant.id) : null}
            onChange={handleVariantChange}
          />
          <div className='h-px bg-gray-200'></div>
          <Accordion className='pb-0'>
            <AccordionItem
              key="info"
              aria-label="Дополнительная информация"
              title="Дополнительная информация"
              indicator={isOpen => {
                return <span className={`block border border-gray-300 rounded-full p-1 ${!isOpen ? 'rotate-180' : ''}`}>
                  <ChevronIcon width={20} height={20}/>
                </span>;
              }}
              classNames={{
                base: 'py-0',
                trigger: 'py-1 px-0 data-[open=true]:pb-1 data-[open=true]:pt-1',
                title: 'text-sm font-normal text-gray-700',
                content: 'text-xs text-gray-600'
              }}
            >
              <div
                className="text-xs leading-relaxed"
                dangerouslySetInnerHTML={{__html: (informationSettings?.description ?? '') as string}}
              />
            </AccordionItem>
          </Accordion>

          <div className='h-px bg-gray-200'></div>
          {(product.Brand?.name || brandLocation || brandSinceText) && (
            <div className='flex items-start gap-4 rounded-2xl bg-white py-4'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-gray-500 uppercase'>
                {sellerInitials}
              </div>
              <div className='flex flex-col gap-2 text-sm text-gray-600'>
                {product.Brand?.name && (
                  <span className='text-base font-semibold text-gray-900'>{product.Brand.name}</span>
                )}
                {brandLocation && (
                  <div className='flex items-start gap-2'>
                    <LocationIcon/>
                    <span className='leading-snug'>{brandLocation}</span>
                  </div>
                )}
                {brandSinceText && (
                  <div className='flex items-start gap-2'>
                    <CalendarIcon/>
                    <span className='leading-snug'>{brandSinceText}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => {
              setDrawerMode('contacts');
              setOrderNumber(undefined);
              setOpen(true);
            }}
            className='w-full rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-100'
          >
            Контакты продавца
          </button>
          <div className='h-px bg-gray-200'></div>
        </div>
        <div className='order-3 flex flex-col gap-7 lg:hidden'>
          <Tabs tabs={productTabs}/>
          <div className='h-px bg-gray-200'></div>
        </div>
      </div>

      {renderProductCarousel({
        title: 'Другие работы продавца',
        subtitle: sellerName || undefined,
        products: otherProductsToDisplay,
        carouselRef: relatedCarouselRef,
        onPrev: handleRelatedPrev,
        onNext: handleRelatedNext,
        layout: relatedLayout,
        groupSuffix: 'related-slider',
        slideKeyPrefix: 'related',
        ariaLabel: 'Другие товары продавца'
      })}

      {renderProductCarousel({
        title: 'Недавно смотрели',
        subtitle: 'Продолжите просмотр понравившихся товаров',
        products: recentProducts,
        carouselRef: recentCarouselRef,
        onPrev: handleRecentPrev,
        onNext: handleRecentNext,
        layout: recentLayout,
        groupSuffix: 'recent-slider',
        slideKeyPrefix: 'recent',
        ariaLabel: 'Недавно просмотренные товары'
      })}
    </div>
    <Drawer open={open} onClose={handleDrawerClose} useCloseBtn={false}>
      {drawerMode === 'contacts' && contactMarkup}
      {drawerMode === 'order' && !orderNumber && orderFormMarkup}
      {drawerMode === 'order' && !!orderNumber && thankYouMarkup}
    </Drawer>
  </main>
}

type RelatedProduct = ProductCardModel

type RecentProductStorage = {
  id: string
  title: string
  price: string
  final_price: string
  image?: string | null
  brand?: string | null
}

type CarouselBreakpoints = Record<number, { perPage: number; gap?: string }>

type CarouselMinimums = {
  desktop?: number
  large?: number
  tablet?: number
  mobile?: number
}

type CarouselLayout = {
  perPage: number
  breakpoints: CarouselBreakpoints
  canScroll: boolean
  canDrag: boolean
  autoWidth: boolean
}

type RenderCarouselConfig = {
  title: string
  subtitle?: string
  products: ProductCardModel[]
  carouselRef: MutableRefObject<InstanceType<typeof Splide> | null>
  onPrev: () => void
  onNext: () => void
  layout: CarouselLayout
  groupSuffix: string
  slideKeyPrefix: string
  ariaLabel: string
}

type BrandContact = {
  id: string | number
  type: string
  value: string
}

type BrandAddress = {
  id: string | number
  name?: string | null
  country: string
  province?: string | null
  city: string
  zip_code?: string | null
  address1?: string | null
  address2?: string | null
}

type Props = {
  product: ProductCardModel
  informationSettings?: {
    description: string
  }
  breadcrumbs?: BreadcrumbItem[]
  otherProducts?: RelatedProduct[]
  brandContacts?: BrandContact[]
  brandAddresses?: BrandAddress[]
}

type Options = {
  id: bigint,
  label: string,
  options: {
    label: string,
    value: string
  }[]
}

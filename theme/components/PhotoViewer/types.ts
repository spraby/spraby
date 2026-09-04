/**
 * Публичные типы PhotoViewer.
 *
 * Компонент намеренно не знает ничего про модели товара, next/image и
 * остальную витрину: на вход он принимает только массив картинок.
 */

/** Картинка галереи: либо готовый src, либо объект с подписью и размерами. */
export type PhotoViewerImage = string | {
  src: string
  alt?: string
  /** Натуральные размеры оригинала. Нужны только чтобы браузер не дёргал вёрстку. */
  width?: number
  height?: number
};

/**
 * Опциональный резолвер URL под нужную ширину. Позволяет отдать превью
 * маленькой копией, не притаскивая в компонент знание про S3 и next/image.
 * По умолчанию — тождественная функция.
 */
export type PhotoViewerImageLoader = (src: string, width: number) => string;

export type PhotoViewerProps = {
  /** Картинки в порядке показа. Пустой массив — компонент ничего не рендерит. */
  images: PhotoViewerImage[]
  /** Открыт ли просмотрщик. Состоянием владеет родитель. */
  open: boolean
  /** С какой картинки открыть. Дальше индекс живёт внутри компонента. */
  initialIndex?: number
  onClose: () => void
  /** Вызывается при каждой смене слайда — чтобы синхронизировать галерею на странице. */
  onIndexChange?: (index: number) => void
  /** Резолвер URL под ширину; по умолчанию src отдаётся как есть. */
  imageLoader?: PhotoViewerImageLoader
};

/** Нормализованный вид картинки — то, с чем работают внутренние слои. */
export type NormalizedImage = {
  src: string
  alt: string
  width?: number
  height?: number
};

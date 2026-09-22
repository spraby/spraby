/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    LOGIN_URL: process.env.LOGIN_URL,
  },
  images: {
    // Картинки не ресайзятся на сервере витрины: API кладёт в S3 готовые
    // уменьшенные копии, а loader выбирает нужную по ширине (см. lib/image-loader.ts).
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // Кандидаты для srcset совпадают с копиями в S3 (400, 800) и оригиналом (до 2000).
    deviceSizes: [400, 800, 2000],
    imageSizes: [],
  },
  // Старый адрес страницы бренда: ссылки из переписок и буфера обмена
  // не должны упираться в 404 после переезда на /brand/<handle>.
  async redirects() {
    return [
      {source: '/brands/:domain', destination: '/brand/:domain', permanent: true},
    ];
  },
};

export default nextConfig;

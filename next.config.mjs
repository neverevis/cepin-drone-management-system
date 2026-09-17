/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // pdfkit carrega arquivos de métricas de fonte (.afm) e fontkit/restructure
  // fazem uso dinâmico de módulos; mantê-los fora do bundle do webpack evita
  // que esses arquivos de dados fiquem para trás no build de produção.
  experimental: {
    serverComponentsExternalPackages: ["pdfkit", "fontkit", "restructure"],
  },
};

export default nextConfig;

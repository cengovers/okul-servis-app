/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
      // Node.js modüllerini tarayıcıda çalıştırmaya çalışmayı engelleyen yapılandırma
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        zlib: false,
      };
      
      return config;
    },
  };
  
  export default nextConfig;
import type { NextConfig } from 'next';
// console.log('Next config loaded with allowedDevOrigins');
const nextConfig: NextConfig = {
    reactStrictMode: false,
    allowedDevOrigins: ['192.168.137.162', 'http://192.168.137.162:3000', 'http://localhost:3000'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
          ],
        // Increase timeout to 30 seconds
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        unoptimized: false,
        // Add loader timeout
        loader: 'default',
        
    },
    
    experimental: {
        serverActions: {
        bodySizeLimit: '5mb',
        },
    },
    

    
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
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
    

    

    
};

export default nextConfig;

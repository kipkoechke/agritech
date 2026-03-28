import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "ui-avatars.com",
                port: "",
                pathname: "/api/**",
            },
            {
                protocol: "https",
                hostname: "ravine.briankimathi.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "orders.ravinedairies.co.ke",
                port: "",
                pathname: "/**",
            },
        ],

        dangerouslyAllowSVG: true,
        contentDispositionType: "attachment",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },

        ];
    },
};

export default nextConfig;

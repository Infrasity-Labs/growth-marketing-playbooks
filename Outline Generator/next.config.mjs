/** @type {import('next').NextConfig} */

import fs from 'fs';
import yaml from 'js-yaml';

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf-8'));

const nextConfig = {
      basePath: '/outline-gen',
  trailingSlash: true,
    env: {
        FEATURE_A: config.FEATURE_A,
        FEATURE_B: config.FEATURE_B,
        FEATURE_C: config.FEATURE_C,
        VISIBLE_TO_USERS: JSON.stringify(config.VISIBLE_TO_USERS),
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
            },
        ],
    },
    // async redirects() {
    //     return [
    //         {
    //             source: '/',
    //             destination: '/outline-gen',
    //             permanent: true,
    //         },
    //     ];
    // },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'if-function', 'color-functions'],
  },
};

module.exports = nextConfig;

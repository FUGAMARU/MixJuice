const withInterceptStdout = require("next-intercept-stdout")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**" // Spotifyのアートワークは複数のドメインに散らばっていて完璧な予測が不可能なので、ワイルドカードによって全てのドメインを許可する
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: "/spotify-token",
        destination: "https://accounts.spotify.com/api/token"
      },
      {
        source: "/spotify-api/:path*",
        destination: "https://api.spotify.com/v1/:path*"
      }
    ]
  }
}

module.exports = withInterceptStdout(nextConfig, text =>
  text.includes("Duplicate atom key") ? "" : text
)

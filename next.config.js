const withInterceptStdout = require("next-intercept-stdout")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "www.lyrical-nonsense.com",
      "m.media-amazon.com",
      "i.scdn.co",
      "is1-ssl.mzstatic.com",
      "ro69-bucket.s3.amazonaws.com"
    ]
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/main"
      },
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

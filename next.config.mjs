/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			// Google / thumbnails
			{ protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
			{ protocol: "https", hostname: "gstatic.com" },
			{ protocol: "https", hostname: "*.gstatic.com" },
			{ protocol: "https", hostname: "*.googleusercontent.com" },

			// YouTube thumbnails
			{ protocol: "https", hostname: "i.ytimg.com" },
			{ protocol: "https", hostname: "*.ytimg.com" },
		],
	},
};

export default nextConfig;

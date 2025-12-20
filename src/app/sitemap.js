export default function sitemap() {
	const baseUrl = "https://savia-sigma.vercel.app";

	const categories = [
		"vegano",
		"frutos-secos",
		"sin-lactosa",
		"sin-tacc",
		"sin-azucar",
		"yuyitos",
		"condimentos",
		"suplementos-vitaminicos",
		"suplementos-dietarios",
		"ofertas",
	];

	const now = new Date();

	return [
		{
			url: `${baseUrl}/`,
			lastModified: now,
			changeFrequency: "daily",
			priority: 1,
		},

		...categories.map((slug) => ({
			url: `${baseUrl}/categoria/${slug}`,
			lastModified: now,
			changeFrequency: "weekly",
			priority: slug === "ofertas" ? 0.9 : 0.8,
		})),
	];
}

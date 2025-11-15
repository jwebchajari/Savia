const encoder = new TextEncoder();

function b64url(input) {
	return Buffer.from(input)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
function b64urlJSON(obj) {
	return b64url(JSON.stringify(obj));
}

async function hmacSHA256(message, secret) {
	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"]
	);
	const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
	return Buffer.from(sig)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}

export function getEnvCreds() {
	const user = process.env.AUTH_USER;
	const pass = process.env.AUTH_PASS;
	const secret = process.env.AUTH_SECRET;
	const base = process.env.RTDB_BASE;
	if (!secret) throw new Error("Falta AUTH_SECRET");
	if (!base) throw new Error("Falta RTDB_BASE");
	return { user, pass, secret, base };
}

export async function signSession(username, ttlMs = 1000 * 60 * 60 * 8) {
	const { secret } = getEnvCreds();
	const head = b64urlJSON({ alg: "HS256", typ: "JWT" });
	const body = b64urlJSON({
		u: username,
		iat: Date.now(),
		exp: Date.now() + ttlMs,
	});
	const sig = await hmacSHA256(`${head}.${body}`, secret);
	return `${head}.${body}.${sig}`;
}

export async function verifySession(token) {
	try {
		const { secret } = getEnvCreds();
		const [h, b, s] = token.split(".");
		if (!h || !b || !s) return null;
		const expected = await hmacSHA256(`${h}.${b}`, secret);
		if (s !== expected) return null;
		const payload = JSON.parse(
			Buffer.from(
				b.replace(/-/g, "+").replace(/_/g, "/"),
				"base64"
			).toString("utf8")
		);
		if (!payload?.exp || Date.now() > payload.exp) return null;
		return payload;
	} catch {
		return null;
	}
}

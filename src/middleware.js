import { NextResponse } from "next/server";

export function middleware(req) {
	const token = req.cookies.get("__session")?.value; // Firebase Auth cookie (si la usas)

	const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;

	// Página que queremos proteger
	const protectedPath = "/root";

	// Si la ruta empieza con /root y no es admin → redirigir a /login
	if (req.nextUrl.pathname.startsWith(protectedPath)) {
		// Si no hay token, redirigir
		if (!token) {
			return NextResponse.redirect(new URL("/login", req.url));
		}

		// Firebase decodifica el token en backend (a futuro si agregamos API route)
		// Por ahora, evitamos acceso directo sin AuthContext en frontend.
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/root/:path*"],
};

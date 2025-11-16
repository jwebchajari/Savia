// middleware.js
import { NextResponse } from "next/server";
import { verifySession } from "../src/_components/lib/auth";

export async function middleware(req) {
	const token = req.cookies.get("adm_auth")?.value;

	if (!token) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	const payload = await verifySession(token);
	if (!payload) {
		const res = NextResponse.redirect(new URL("/login", req.url));
		res.cookies.delete("adm_auth");
		return res;
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/adm/:path*"],
};

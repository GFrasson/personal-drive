import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, signAdminToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json().catch(() => ({
      username: undefined,
      password: undefined,
    }));

    const adminUser = process.env.ADMIN_USER ?? "admin";
    const adminPass = process.env.ADMIN_PASS ?? "admin";

    if (username === adminUser && password === adminPass) {
      const token = await signAdminToken(username);
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: AUTH_COOKIE.name,
        value: token,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: AUTH_COOKIE.maxAge,
      });
      return response;
    }

    return NextResponse.json(
      { error: "Credenciais inválidas" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro no login" }, { status: 500 });
  }
}



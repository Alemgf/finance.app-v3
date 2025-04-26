import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Verificar se o usuário está tentando acessar uma página protegida
  const isProtectedRoute =
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/register") &&
    !request.nextUrl.pathname.includes("/_next") &&
    !request.nextUrl.pathname.includes("/favicon.ico")

  // Obter o userId do cookie (não é possível acessar localStorage no middleware)
  const userId = request.cookies.get("userId")?.value

  // Se for uma rota protegida e o usuário não estiver autenticado, redirecionar para o login
  if (isProtectedRoute && !userId) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se o usuário estiver autenticado e tentar acessar login/register, redirecionar para home
  if ((request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register")) && userId) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Configurar quais rotas o middleware deve ser executado
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

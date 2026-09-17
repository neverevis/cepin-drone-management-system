import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Protege todas as rotas exceto:
     * - /login
     * - /api/auth (NextAuth)
     * - arquivos estáticos do Next.js
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }) {
      if (account && user) {
        token.accessToken = account.access_token ?? undefined;
        token.id = user.id ?? undefined;
        token.email = user.email ?? undefined;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id!;
      session.user.email = token.email!;
      session.user.name = token.name!;
      session.user.image = token.picture!;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 로그인 성공 후 리디렉션할 URL을 지정합니다.
      return `${baseUrl}/waiting`;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // 개발 환경에서만 디버그 모드 활성화
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

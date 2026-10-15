import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
export const googleEnabled = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);
export const emailEnabled = Boolean(
  process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM,
);
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    ...(googleEnabled ? [Google] : []),
    ...(emailEnabled
      ? [
          Resend({
            apiKey: process.env.AUTH_RESEND_KEY,
            from: process.env.AUTH_EMAIL_FROM,
          }),
        ]
      : []),
  ],
  pages: { signIn: '/sign-in' },
  session: { strategy: 'database' },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});

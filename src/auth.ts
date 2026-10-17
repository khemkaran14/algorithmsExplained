import { logFailure, logVerificationFailure } from '@/lib/logger';
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
const adapter = PrismaAdapter(db);
const consumeVerificationToken = adapter.useVerificationToken;
if (consumeVerificationToken) {
  adapter.useVerificationToken = async (input) => {
    const token = await consumeVerificationToken(input);
    if (!token) logVerificationFailure('token_not_found');
    else if (token.expires.valueOf() < Date.now())
      logVerificationFailure('token_expired');
    return token;
  };
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  logger: {
    error: (error) => logFailure('auth_failure', error),
    warn: () => logFailure('auth_warning'),
    debug: () => undefined,
  },
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

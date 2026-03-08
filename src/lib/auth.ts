import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export enum UserRole {
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  INTERVIEWER = 'INTERVIEWER',
  CANDIDATE = 'CANDIDATE',
}

declare module 'next-auth' {
  interface User {
    id: string
    role: UserRole
    activeSessionToken?: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    activeSessionToken?: string
    currentSessionToken?: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('No user found with this email')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        // Generate a new session token for single-device enforcement
        const sessionToken = crypto.randomUUID()

        // Update user's active session token (invalidates any existing sessions)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            activeSessionToken: sessionToken,
            lastLoginAt: new Date(),
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          activeSessionToken: sessionToken,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // Store both the token assigned at login (currentSessionToken)
        // and what the DB considers active (activeSessionToken)
        token.currentSessionToken = user.activeSessionToken
        token.activeSessionToken = user.activeSessionToken
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

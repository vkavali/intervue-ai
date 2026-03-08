import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

const VALID_TYPES = [
  'CANDIDATE_CLEARED',
  'SESSION_COMPLETED',
  'REVIEW_PENDING',
  'CANDIDATE_WAITING',
  'PIPELINE_UPDATE',
  'SYSTEM',
]

// POST /api/notifications/send - Internal endpoint to create notifications
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and interviewers can send notifications
    if (
      session.user.role !== 'COMPANY_ADMIN' &&
      session.user.role !== 'INTERVIEWER'
    ) {
      return NextResponse.json(
        { error: 'Only admins and interviewers can send notifications' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { userId, type, title, message, link } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title, and message are required' },
        { status: 400 }
      )
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const notification = await createNotification({
      userId,
      type,
      title,
      message,
      link,
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('POST /api/notifications/send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

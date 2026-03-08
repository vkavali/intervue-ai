import { prisma } from './prisma'

export async function createNotification(params: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  return prisma.notification.create({ data: params })
}

export async function notifyCompanyAdmins(params: {
  companyId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  const admins = await prisma.user.findMany({
    where: { companyId: params.companyId, role: 'COMPANY_ADMIN' },
  })
  const { companyId, ...notificationData } = params
  return Promise.all(
    admins.map((admin) =>
      createNotification({ ...notificationData, userId: admin.id })
    )
  )
}

// ─── Specific notification creators ──────────────────────────────────────────

export async function notifyCandidateCleared(
  companyId: string,
  candidateName: string,
  role: string,
  sessionId: string
) {
  return notifyCompanyAdmins({
    companyId,
    type: 'CANDIDATE_CLEARED',
    title: `${candidateName} cleared the interview`,
    message: `${candidateName} has been recommended for hire for the ${role} position. Review their results and consider extending an offer.`,
    link: `/dashboard/sessions/${sessionId}`,
  })
}

export async function notifySessionCompleted(
  companyId: string,
  candidateName: string,
  interviewTitle: string,
  sessionId: string
) {
  return notifyCompanyAdmins({
    companyId,
    type: 'SESSION_COMPLETED',
    title: `Interview completed: ${candidateName}`,
    message: `${candidateName} has completed the ${interviewTitle} interview. An audit report is ready for review.`,
    link: `/dashboard/sessions/${sessionId}`,
  })
}

export async function notifyCandidateWaiting(
  companyId: string,
  candidateName: string,
  role: string,
  daysSinceCleared: number
) {
  return notifyCompanyAdmins({
    companyId,
    type: 'CANDIDATE_WAITING',
    title: `Reminder: ${candidateName} is waiting`,
    message: `${candidateName} cleared the ${role} interview ${daysSinceCleared} days ago but hasn't been hired yet. Consider reaching out before they accept another offer.`,
    link: `/dashboard/candidates`,
  })
}

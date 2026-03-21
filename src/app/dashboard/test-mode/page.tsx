import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import TestModePage from '@/components/test-mode/TestModePage';

export default async function TestModePageRoute() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'COMPANY_ADMIN') {
    redirect('/dashboard');
  }

  return <TestModePage />;
}

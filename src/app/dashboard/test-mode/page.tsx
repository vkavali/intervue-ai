import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import TestModePage from '@/components/test-mode/TestModePage';

export default async function TestModePageRoute() {
  const session = await getServerSession(authOptions);

  const testModeEmail = process.env.TEST_MODE_EMAIL;
  if (!session || session.user.email !== testModeEmail) {
    redirect('/dashboard');
  }

  return <TestModePage />;
}

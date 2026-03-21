import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DemoModePage from '@/components/test-mode/DemoModePage';

export default async function TestModePageRoute() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/dashboard');
  }

  const testModeEmail = process.env.TEST_MODE_EMAIL;
  // If TEST_MODE_EMAIL is set, restrict to that email only
  // If not set, fall back to any COMPANY_ADMIN
  if (testModeEmail) {
    if (session.user.email !== testModeEmail) {
      redirect('/dashboard');
    }
  } else {
    if (session.user.role !== 'COMPANY_ADMIN') {
      redirect('/dashboard');
    }
  }

  return <DemoModePage />;
}

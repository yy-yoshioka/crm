import Link from 'next/link';
import { Button } from '@/app/components/ui/Button';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';

export default function CustomerNotFound() {
  return (
    <>
      <Navbar />
      <PageContainer
        title="Not Found"
        description="The requested customer could not be found"
      >
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Customer Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn&apos;t find the customer you&apos;re looking for. It may
              have been deleted or you may have entered an invalid ID.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/customers">
                <Button>Back to customers</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Go to dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export default function CustomerDetailLoading() {
  return (
    <>
      <Navbar />
      <PageContainer
        title="Loading Customer..."
        description="Please wait"
      >
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    </>
  );
}
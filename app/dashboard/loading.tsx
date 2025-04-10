import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';

export default function DashboardLoading() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    </>
  );
}

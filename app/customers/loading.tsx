import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export default function CustomersLoading() {
  return (
    <>
      <Navbar />
      <PageContainer
        title="Customers"
        description="View and manage your customer list"
      >
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    </>
  );
}

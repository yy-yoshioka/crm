import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export default function NewCustomerLoading() {
  return (
    <>
      <Navbar />
      <PageContainer
        title="Add New Customer"
        description="Create a new customer record in the system"
      >
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    </>
  );
}
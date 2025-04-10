import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export default function EditCustomerLoading() {
  return (
    <>
      <Navbar />
      <PageContainer
        title="Edit Customer"
        description="Update customer information"
      >
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    </>
  );
}
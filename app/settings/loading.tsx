import { PageContainer } from '@/app/components/layout/PageContainer';
import { Navbar } from '@/app/components/layout/Navbar';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

export default function SettingsLoading() {
  return (
    <>
      <Navbar />
      <PageContainer
        title="Account Settings"
        description="Manage your account and preferences"
      >
        <div className="h-96 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    </>
  );
}

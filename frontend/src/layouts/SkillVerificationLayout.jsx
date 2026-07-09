import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProductSectionNav from '../components/ProductSectionNav';
import SkillVerificationSidebar from '../components/SkillVerificationSidebar';

export default function SkillVerificationLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-text-main">
      <TopBar />
      <ProductSectionNav />
      
      <div className="flex flex-1 overflow-hidden">
        <SkillVerificationSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

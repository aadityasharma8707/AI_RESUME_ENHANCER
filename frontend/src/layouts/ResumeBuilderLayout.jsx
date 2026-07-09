import { Outlet } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProductSectionNav from '../components/ProductSectionNav';
import ResumeBuilderSidebar from '../components/ResumeBuilderSidebar';

export default function ResumeBuilderLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-text-main">
      <TopBar />
      <ProductSectionNav />
      
      <div className="flex flex-1 overflow-hidden">
        <ResumeBuilderSidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

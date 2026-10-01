import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { BottomNav, TopNav, MobileHeader, type TabType } from './components/Navigation';
import { SharedHubPage } from './components/SharedHubPage';
import { DailyCheckinPage } from './components/DailyCheckinPage';
import { CalendarPage } from './components/CalendarPage';
import { TimelinePage } from './components/TimelinePage';
import ProfileDrawer from './components/ProfileDrawer';
import HouseholdSettings from './components/HouseholdSettings';
import AuthPage from './pages/AuthPage';
import PairingPage from './pages/PairingPage';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [profileOpen, setProfileOpen] = useState(false);
  const [householdOpen, setHouseholdOpen] = useState(false);
  const { household, householdProfiles, daysTogether } = useAuth();

  const renderPage = () => {
    switch (activeTab) {
      case 'hub':
        return <SharedHubPage />;
      case 'checkin':
        return <DailyCheckinPage />;
      case 'calendar':
        return <CalendarPage />;
      case 'timeline':
        return <TimelinePage />;
      default:
        return <SharedHubPage />;
    }
  };

  const householdName = household?.name || 'Our Household';

  return (
    <div className="min-h-screen bg-cream-50">
      {/* 移动端顶部 Header */}
      <MobileHeader
        householdName={householdName}
        daysTogether={daysTogether}
        profiles={householdProfiles}
        onHouseholdClick={() => setHouseholdOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      />

      {/* 顶部导航（桌面端） */}
      <TopNav
        activeTab={activeTab}
        onChange={setActiveTab}
        householdName={householdName}
        daysTogether={daysTogether}
        profiles={householdProfiles}
        onHouseholdClick={() => setHouseholdOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
      />

      {/* 主要内容 */}
      <main key={activeTab} className="animate-fade-in-up pt-14 md:pt-20">
        {renderPage()}
      </main>

      {/* 底部导航（移动端） */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* 空间设置抽屉 */}
      <HouseholdSettings open={householdOpen} onClose={() => setHouseholdOpen(false)} />

      {/* 个人中心抽屉 */}
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

function AppContent() {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-ink-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录 → 登录注册页
  if (!user) {
    return <AuthPage />;
  }

  // 已登录但未配对 → 配对引导页
  if (!profile?.household_id) {
    return <PairingPage />;
  }

  // 已配对 → 主应用
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

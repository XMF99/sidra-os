import { FC, useEffect, useState, ReactNode } from 'react';
import { RouteErrorBoundary } from '../app/boundaries/RouteErrorBoundary';
import { NotFound } from '../pages/NotFound';
import { ComponentGallery } from '../pages/dev/ComponentGallery';
import { ProjectsPage } from '../pages/projects/ProjectsPage';
import { DeveloperConsole } from '../developer-console/DeveloperConsole';
import { SetupWizard } from '../pages/setup/SetupWizard';
import { GameStudioManager } from '../pages/game-studio/GameStudioManager';
import { AIWorkspacePage } from '../pages/ai/AIWorkspacePage';
import { ThekyConsolePage } from '../pages/console/ThekyConsolePage';
import { MarketplacePage } from '../pages/marketplace/MarketplacePage';
import { OrganizationSpacesPage } from '../pages/spaces/OrganizationSpacesPage';
import { FirstExperienceHome } from '../pages/home/FirstExperienceHome';
import { ProjectCommandCenterPage } from '../pages/projects/ProjectCommandCenterPage';
import { UniversalTimelineView } from '../components/timeline/UniversalTimelineView';
import { GlobalCommandCenterModal } from '../components/common/GlobalCommandCenterModal';
import { IntelligenceCorePage } from '../pages/intelligence/IntelligenceCorePage';
import { CognitiveEnginePage } from '../pages/cognitive/CognitiveEnginePage';
import { DigitalTwinPage } from '../pages/digital-twin/DigitalTwinPage';
import { ExecutiveControlTowerPage } from '../pages/orchestrator/ExecutiveControlTowerPage';
import { AiEcosystemPage } from '../pages/ecosystem/AiEcosystemPage';
import { CapabilityPlatformPage } from '../pages/capability-platform/CapabilityPlatformPage';
import { BusinessSolutionPage } from '../pages/solution-composer/BusinessSolutionPage';
import { EnterprisePlatformPage } from '../pages/enterprise-composer/EnterprisePlatformPage';
import { AutonomousOrgPage } from '../pages/autonomous-org/AutonomousOrgPage';
import { PlatformCertificationPage } from '../pages/certification/PlatformCertificationPage';
import { ExecutiveSuitePage } from '../pages/executive-suite/ExecutiveSuitePage';
import { FinanceSuitePage } from '../pages/finance-suite/FinanceSuitePage';
import { HumanCapitalSuitePage } from '../pages/human-capital-suite/HumanCapitalSuitePage';
import { CrmSuitePage } from '../pages/crm-suite/CrmSuitePage';
import { SalesSuitePage } from '../pages/sales-suite/SalesSuitePage';
import { MarketingSuitePage } from '../pages/marketing-suite/MarketingSuitePage';
import { OperationsSuitePage } from '../pages/operations-suite/OperationsSuitePage';
import { SupplyChainSuitePage } from '../pages/supply-chain-suite/SupplyChainSuitePage';
import { ProjectSuitePage } from '../pages/project-suite/ProjectSuitePage';
import { GameStudioSuitePage } from '../pages/game-studio-suite/GameStudioSuitePage';

// Room components
import { Archive } from '../rooms/Archive';
import { ArtifactsRoom } from '../rooms/ArtifactsRoom';
import { Boardroom } from '../rooms/Boardroom';
import { Console } from '../rooms/Console';
import { DashboardRoom } from '../rooms/DashboardRoom';
import { Department } from '../rooms/Department';
import { EventLogRoom } from '../rooms/EventLogRoom';
import { Lobby } from '../rooms/Lobby';
import { SeatsRoom } from '../rooms/SeatsRoom';
import { Settings } from '../rooms/Settings';
import { SystemHealthRoom } from '../rooms/SystemHealthRoom';
import { Vault } from '../rooms/Vault';

interface Props {
  children?: ReactNode;
  fallbackComponent?: ReactNode;
}

export function matchRouteComponent(rawPath: string): ReactNode {
  const cleanPath = rawPath.split('?')[0] || '/';

  const isOnboardingCompleted =
    typeof window !== 'undefined' && window.localStorage
      ? window.localStorage.getItem('sidra_onboarding_completed') === 'true' ||
        window.localStorage.getItem('sidra_setup_completed') === 'true'
      : false;

  // Setup / Onboarding Routes
  if (cleanPath === '/setup' || cleanPath === '/welcome' || cleanPath === '/onboarding') {
    return <SetupWizard />;
  }

  // Game Studio Manager Route
  if (cleanPath === '/studio' || cleanPath === '/game-studio' || cleanPath === '/gamestudio') {
    return <GameStudioManager />;
  }

  if (cleanPath === '/game-studio-suite' || cleanPath === '/studio-workspace' || cleanPath === '/ai-director' || cleanPath === '/design-art' || cleanPath === '/engineering-audio' || cleanPath === '/qa-liveops' || cleanPath === '/studio-twin' || cleanPath === '/studio-auditor' || cleanPath === '/studio-reports' || cleanPath.startsWith('/game-studio-suite/')) {
    return (
      <>
        <GameStudioSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/project-suite' || cleanPath === '/portfolio-workspace' || cleanPath === '/ai-pmo' || cleanPath === '/programs-projects' || cleanPath === '/resource-financials' || cleanPath === '/project-twin' || cleanPath === '/portfolio-auditor' || cleanPath === '/project-reports' || cleanPath.startsWith('/project-suite/')) {
    return (
      <>
        <ProjectSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/supply-chain-suite' || cleanPath === '/supply-workspace' || cleanPath === '/ai-csco' || cleanPath === '/procurement-suppliers' || cleanPath === '/warehouse-logistics' || cleanPath === '/supply-twin' || cleanPath === '/supply-auditor' || cleanPath === '/supply-reports' || cleanPath.startsWith('/supply-chain-suite/')) {
    return (
      <>
        <SupplyChainSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/operations-suite' || cleanPath === '/operations-workspace' || cleanPath === '/ai-coo' || cleanPath === '/execution-control' || cleanPath === '/resource-workflows' || cleanPath === '/operations-twin' || cleanPath === '/operations-auditor' || cleanPath === '/operations-reports' || cleanPath.startsWith('/operations-suite/')) {
    return (
      <>
        <OperationsSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/marketing-suite' || cleanPath === '/marketing-workspace' || cleanPath === '/ai-cmo' || cleanPath === '/campaigns' || cleanPath === '/audience-content' || cleanPath === '/marketing-twin' || cleanPath === '/marketing-auditor' || cleanPath === '/marketing-reports' || cleanPath.startsWith('/marketing-suite/')) {
    return (
      <>
        <MarketingSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/sales-suite' || cleanPath === '/sales-workspace' || cleanPath === '/ai-cro' || cleanPath === '/opportunity-quotes' || cleanPath === '/contracts' || cleanPath === '/sales-twin' || cleanPath === '/revenue-auditor' || cleanPath === '/revenue-reports' || cleanPath.startsWith('/sales-suite/')) {
    return (
      <>
        <SalesSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/crm-suite' || cleanPath === '/customer-workspace' || cleanPath === '/ai-cco' || cleanPath === '/sales-pipeline' || cleanPath === '/customer-success' || cleanPath === '/crm-twin' || cleanPath === '/crm-auditor' || cleanPath === '/crm-reports' || cleanPath.startsWith('/crm-suite/')) {
    return (
      <>
        <CrmSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/human-capital-suite' || cleanPath === '/people-workspace' || cleanPath === '/ai-chro' || cleanPath === '/recruitment' || cleanPath === '/employee-lifecycle' || cleanPath === '/people-twin' || cleanPath === '/people-auditor' || cleanPath === '/hr-reports' || cleanPath.startsWith('/human-capital-suite/')) {
    return (
      <>
        <HumanCapitalSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/finance-suite' || cleanPath === '/financial-workspace' || cleanPath === '/ai-cfo' || cleanPath === '/general-ledger' || cleanPath === '/ar-ap' || cleanPath === '/financial-twin' || cleanPath === '/financial-auditor' || cleanPath === '/financial-reports' || cleanPath.startsWith('/finance-suite/')) {
    return (
      <>
        <FinanceSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/executive-suite' || cleanPath === '/ceo-workspace' || cleanPath === '/executive-board' || cleanPath === '/war-room' || cleanPath === '/executive-decisions' || cleanPath === '/executive-briefing' || cleanPath === '/financial-snapshot' || cleanPath === '/enterprise-radar' || cleanPath === '/executive-memory' || cleanPath.startsWith('/executive-suite/')) {
    return (
      <>
        <ExecutiveSuitePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/certification' || cleanPath === '/integration-health' || cleanPath === '/platform-flow' || cleanPath.startsWith('/certification/')) {
    return (
      <>
        <PlatformCertificationPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/autonomous-org' || cleanPath === '/command-center' || cleanPath === '/workforce' || cleanPath === '/department-runtime' || cleanPath === '/daily-briefing' || cleanPath === '/autonomous-decisions' || cleanPath === '/operational-analytics' || cleanPath.startsWith('/autonomous-org/')) {
    return (
      <>
        <AutonomousOrgPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/enterprise-composer' || cleanPath === '/enterprises' || cleanPath === '/departments' || cleanPath === '/org-chart' || cleanPath === '/master-blueprints' || cleanPath === '/enterprise-templates' || cleanPath === '/enterprise-analytics' || cleanPath.startsWith('/enterprise-composer/')) {
    return (
      <>
        <EnterprisePlatformPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/solutions' || cleanPath === '/solution-composer' || cleanPath === '/blueprints' || cleanPath === '/solution-templates' || cleanPath === '/impact-analytics' || cleanPath.startsWith('/solutions/')) {
    return (
      <>
        <BusinessSolutionPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/capability-platform' || cleanPath === '/capabilities' || cleanPath === '/composer' || cleanPath === '/capability-graph' || cleanPath === '/capability-templates' || cleanPath === '/capability-analytics' || cleanPath.startsWith('/capability-platform/')) {
    return (
      <>
        <CapabilityPlatformPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/ecosystem' || cleanPath === '/providers' || cleanPath === '/router' || cleanPath === '/mcp' || cleanPath === '/connectors' || cleanPath === '/prompts' || cleanPath === '/cost' || cleanPath.startsWith('/ecosystem/')) {
    return (
      <>
        <AiEcosystemPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/orchestrator' || cleanPath === '/control-tower' || cleanPath === '/contracts' || cleanPath === '/decomposition' || cleanPath === '/recovery' || cleanPath.startsWith('/orchestrator/')) {
    return (
      <>
        <ExecutiveControlTowerPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/digital-twin' || cleanPath === '/simulation' || cleanPath === '/what-if' || cleanPath === '/resource-optimizer' || cleanPath === '/opportunities' || cleanPath.startsWith('/digital-twin/')) {
    return (
      <>
        <DigitalTwinPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/cognitive' || cleanPath === '/cognitive-modes' || cleanPath === '/perspectives' || cleanPath === '/meta-reasoning' || cleanPath === '/assumptions' || cleanPath.startsWith('/cognitive/')) {
    return (
      <>
        <CognitiveEnginePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/intelligence' || cleanPath === '/dna' || cleanPath === '/memory' || cleanPath === '/graph' || cleanPath === '/decisions-journal' || cleanPath.startsWith('/intelligence/')) {
    return (
      <>
        <IntelligenceCorePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/timeline') {
    return (
      <>
        <UniversalTimelineView />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath.startsWith('/projects/')) {
    return (
      <>
        <ProjectCommandCenterPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/marketplace' || cleanPath === '/capabilities' || cleanPath === '/blueprints' || cleanPath.startsWith('/marketplace/')) {
    return (
      <>
        <MarketplacePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/spaces' || cleanPath.startsWith('/spaces/')) {
    return (
      <>
        <OrganizationSpacesPage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/console' || cleanPath === '/theky' || cleanPath.startsWith('/console/')) {
    return (
      <>
        <ThekyConsolePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  if (cleanPath === '/workspace' || cleanPath.startsWith('/workspace/') || cleanPath === '/ai' || cleanPath.startsWith('/ai/') || cleanPath === '/decisions') {
    return (
      <>
        <AIWorkspacePage />
        <GlobalCommandCenterModal />
      </>
    );
  }

  // Exact & home routes
  if (cleanPath === '/' || cleanPath === '' || cleanPath === '/dashboard' || cleanPath === '/home') {
    if (!isOnboardingCompleted) {
      return <SetupWizard />;
    }
    return (
      <>
        <FirstExperienceHome />
        <GlobalCommandCenterModal />
      </>
    );
  }
  if (cleanPath === '/developer' || cleanPath === '/dev') {
    return <DeveloperConsole />;
  }
  if (cleanPath === '/dev/gallery') {
    return <ComponentGallery />;
  }

  // Work & Missions
  if (cleanPath === '/missions' || cleanPath.startsWith('/missions/')) {
    return <Lobby />;
  }

  // Organization
  if (cleanPath === '/org' || cleanPath.startsWith('/org/')) {
    return <Boardroom />;
  }

  // Departments
  if (cleanPath === '/departments' || cleanPath.startsWith('/departments/')) {
    return <Department />;
  }

  // Agents & Seats
  if (cleanPath === '/agents' || cleanPath.startsWith('/agents/')) {
    return <SeatsRoom />;
  }

  // Projects Workspace
  if (cleanPath === '/projects' || cleanPath.startsWith('/projects/')) {
    return <ProjectsPage />;
  }

  // Knowledge & Vault
  if (cleanPath === '/knowledge' || cleanPath.startsWith('/knowledge/')) {
    return <Vault />;
  }

  // Connectors & Artifacts
  if (cleanPath === '/connectors' || cleanPath.startsWith('/connectors/')) {
    return <ArtifactsRoom />;
  }

  // Analytics & Health
  if (cleanPath === '/analytics') {
    return <SystemHealthRoom />;
  }

  // Event Log
  if (cleanPath === '/events') {
    return <EventLogRoom />;
  }

  // Settings
  if (cleanPath === '/settings') {
    return <Settings />;
  }

  // Direct Room Routes
  if (cleanPath === '/rooms/archive' || cleanPath === '/archive') {
    return <Archive />;
  }
  if (cleanPath === '/rooms/artifacts' || cleanPath === '/artifacts') {
    return <ArtifactsRoom />;
  }
  if (cleanPath === '/rooms/boardroom' || cleanPath === '/boardroom') {
    return <Boardroom />;
  }
  if (cleanPath === '/rooms/console' || cleanPath === '/console') {
    return <Console />;
  }
  if (cleanPath === '/rooms/dashboard') {
    return <DashboardRoom />;
  }
  if (cleanPath === '/rooms/department') {
    return <Department />;
  }
  if (cleanPath === '/rooms/events' || cleanPath === '/rooms/event-log') {
    return <EventLogRoom />;
  }
  if (cleanPath === '/rooms/lobby' || cleanPath === '/lobby') {
    return <Lobby />;
  }
  if (cleanPath === '/rooms/seats' || cleanPath === '/seats') {
    return <SeatsRoom />;
  }
  if (cleanPath === '/rooms/settings') {
    return <Settings />;
  }
  if (cleanPath === '/rooms/system-health' || cleanPath === '/rooms/health' || cleanPath === '/health') {
    return <SystemHealthRoom />;
  }
  if (cleanPath === '/rooms/vault' || cleanPath === '/vault') {
    return <Vault />;
  }
  if (cleanPath === '/rooms/voice' || cleanPath === '/voice') {
    return <Lobby />;
  }

  return <NotFound />;
}

export const HashRouter: FC<Props> = () => {
  const [currentHash, setCurrentHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'
  );

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const rawPath = currentHash.replace(/^#/, '').split('?')[0] || '/';
  const componentToRender = matchRouteComponent(rawPath);

  return (
    <RouteErrorBoundary>
      <div data-current-hash={currentHash} style={{ height: '100%', width: '100%' }}>
        {componentToRender}
      </div>
    </RouteErrorBoundary>
  );
};

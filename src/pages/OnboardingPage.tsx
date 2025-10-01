// src/pages/OnboardingPage.tsx
import { OnboardingScreen } from '../components/shared/OnboardingScreen';

export default function OnboardingPage() {
  return <OnboardingScreen navigateToScreen={(screen) => window.location.href = `/${screen}`} user={null} />;
}
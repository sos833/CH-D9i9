import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the new onboarding page instead of the dashboard
  redirect('/onboarding');
}

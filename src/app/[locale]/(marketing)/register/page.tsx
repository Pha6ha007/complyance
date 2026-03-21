import { redirect } from 'next/navigation';

// /register redirects to /login in register mode
// This ensures "Get Started Free" links and direct /register visits work
export default function RegisterPage() {
  redirect('/login?mode=register');
}

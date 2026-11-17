import { redirect } from 'next/navigation';

export default function ExploreRedirectPage() {
  redirect('/admin/users');
}

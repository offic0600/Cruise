import { redirect } from 'next/navigation';

export default function TeamSettingsIndexPage() {
  redirect('/teams/current/settings/templates');
}

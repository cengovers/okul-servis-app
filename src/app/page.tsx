import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
  
  // Bu kısım asla çalışmayacak, yönlendirme olacak
  return null;
}
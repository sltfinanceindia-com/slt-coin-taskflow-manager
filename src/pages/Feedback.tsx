import { useAuth } from '@/hooks/useAuth';
import FeedbackForm from '@/components/feedback/FeedbackForm';

export default function FeedbackPage() {
  const { profile } = useAuth();
  
  return (
    <FeedbackForm 
      userEmail={profile?.email} 
      userName={profile?.full_name} 
    />
  );
}

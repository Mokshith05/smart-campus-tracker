import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmergencyContact } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Shield, Ambulance, Building2, Flame, Badge } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-6 h-6" />,
  Ambulance: <Ambulance className="w-6 h-6" />,
  Building2: <Building2 className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Badge: <Badge className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  security: 'bg-red-500/10 text-red-600 border-red-500/20',
  medical: 'bg-green-500/10 text-green-600 border-green-500/20',
  hostel: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  fire: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  police: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function SOSSection() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .order('priority');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Phone className="w-5 h-5" />
          Emergency Contacts (SOS)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {contacts.map((contact) => (
            <Button
              key={contact.id}
              variant="outline"
              className={`h-auto flex-col gap-2 py-4 ${categoryColors[contact.category] || ''}`}
              onClick={() => handleCall(contact.phone)}
            >
              {contact.icon && iconMap[contact.icon]}
              <span className="text-xs font-medium">{contact.name}</span>
              <span className="text-xs opacity-70">{contact.phone}</span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Tap to call. For emergencies only.
        </p>
      </CardContent>
    </Card>
  );
}

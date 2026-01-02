import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface GeoFenceValidatorProps {
  onValidation?: (isWithinFence: boolean, location: { lat: number; lng: number }) => void;
  showCard?: boolean;
}

export function GeoFenceValidator({ onValidation, showCard = true }: GeoFenceValidatorProps) {
  const { profile } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isWithinFence, setIsWithinFence] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    enable_geo_fencing: boolean;
    office_latitude: number;
    office_longitude: number;
    geo_fence_radius_meters: number;
  } | null>(null);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!profile?.organization_id) return;

      const { data } = await supabase
        .from('attendance_settings')
        .select('enable_geo_fencing, office_latitude, office_longitude, geo_fence_radius_meters')
        .eq('organization_id', profile.organization_id)
        .single();

      if (data) {
        setSettings(data);
      } else {
        // Default: geo-fencing disabled
        setSettings({
          enable_geo_fencing: false,
          office_latitude: 0,
          office_longitude: 0,
          geo_fence_radius_meters: 100
        });
      }
    };

    fetchSettings();
  }, [profile?.organization_id]);

  useEffect(() => {
    if (!settings) return;

    if (!settings.enable_geo_fencing) {
      setIsLoading(false);
      setIsWithinFence(true);
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLocation({ lat: userLat, lng: userLng });

        const distance = calculateDistance(
          userLat,
          userLng,
          settings.office_latitude,
          settings.office_longitude
        );

        const withinFence = distance <= settings.geo_fence_radius_meters;
        setIsWithinFence(withinFence);
        setIsLoading(false);

        onValidation?.(withinFence, { lat: userLat, lng: userLng });
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [settings, onValidation]);

  if (!showCard) return null;

  if (!settings?.enable_geo_fencing) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Location Verification</p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking your location...
              </div>
            ) : error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {location && `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
              </p>
            )}
          </div>
          {!isLoading && !error && (
            <Badge variant={isWithinFence ? 'default' : 'destructive'} className="gap-1">
              {isWithinFence ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Within Office
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Outside Fence
                </>
              )}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function useGeoFence() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<{
    enable_geo_fencing: boolean;
    office_latitude: number;
    office_longitude: number;
    geo_fence_radius_meters: number;
  } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!profile?.organization_id) return;

      const { data } = await supabase
        .from('attendance_settings')
        .select('enable_geo_fencing, office_latitude, office_longitude, geo_fence_radius_meters')
        .eq('organization_id', profile.organization_id)
        .single();

      setSettings(data || {
        enable_geo_fencing: false,
        office_latitude: 0,
        office_longitude: 0,
        geo_fence_radius_meters: 100
      });
    };

    fetchSettings();
  }, [profile?.organization_id]);

  const validateLocation = async (): Promise<{ isValid: boolean; location: { lat: number; lng: number } | null }> => {
    if (!settings?.enable_geo_fencing) {
      return { isValid: true, location: null };
    }

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ isValid: false, location: null });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          
          const R = 6371e3;
          const φ1 = (userLat * Math.PI) / 180;
          const φ2 = (settings.office_latitude * Math.PI) / 180;
          const Δφ = ((settings.office_latitude - userLat) * Math.PI) / 180;
          const Δλ = ((settings.office_longitude - userLng) * Math.PI) / 180;

          const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          resolve({
            isValid: distance <= settings.geo_fence_radius_meters,
            location: { lat: userLat, lng: userLng }
          });
        },
        () => resolve({ isValid: false, location: null }),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return { settings, validateLocation };
}

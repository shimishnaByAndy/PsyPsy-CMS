import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wifi,
  WifiOff,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings
} from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface SyncMetadata {
  last_sync: string | null;
  pending_uploads: string[];
  conflict_notes: string[];
  sync_enabled: boolean;
  firebase_collection: string;
}

interface SyncStatusCardProps {
  onConflictResolution?: () => void;
}

export function SyncStatusCard({ onConflictResolution }: SyncStatusCardProps) {
  const [syncStatus, setSyncStatus] = useState<SyncMetadata | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    checkSyncStatus();
    checkNetworkStatus();

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check sync status every 30 seconds
    const interval = setInterval(checkSyncStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkSyncStatus = async () => {
    try {
      const result = await invoke<any>('get_sync_status');
      if (result.success) {
        setSyncStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkNetworkStatus = async () => {
    try {
      const result = await invoke<any>('check_network_connectivity');
      if (result.success) {
        setIsOnline(result.data);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline || !syncStatus?.sync_enabled) return;

    setIsSyncing(true);
    try {
      const result = await invoke<any>('perform_manual_sync');
      if (result.success) {
        console.log('Manual sync completed');
        await checkSyncStatus();
      } else {
        console.error('Manual sync failed:', result.error);
      }
    } catch (error) {
      console.error('Error performing manual sync:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSync = async () => {
    if (!syncStatus) return;

    try {
      const result = await invoke<any>('set_sync_enabled', {
        enabled: !syncStatus.sync_enabled
      });
      if (result.success) {
        await checkSyncStatus();
      }
    } catch (error) {
      console.error('Error toggling sync:', error);
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never';

    const date = new Date(lastSync);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getSyncStatusBadge = () => {
    if (!isOnline) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <WifiOff className="h-3 w-3" />
          Offline
        </Badge>
      );
    }

    if (!syncStatus?.sync_enabled) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Settings className="h-3 w-3" />
          Sync Disabled
        </Badge>
      );
    }

    if (syncStatus.conflict_notes.length > 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Conflicts
        </Badge>
      );
    }

    if (syncStatus.pending_uploads.length > 0) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Synced
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span className="ml-2">Checking sync status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Offline Sync Status
          </div>
          {getSyncStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            Last sync: {formatLastSync(syncStatus?.last_sync || null)}
          </span>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {syncStatus?.pending_uploads.length || 0}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-red-600">
              {syncStatus?.conflict_notes.length || 0}
            </div>
            <div className="text-xs text-gray-600">Conflicts</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600">
              {syncStatus?.sync_enabled ? '✓' : '✗'}
            </div>
            <div className="text-xs text-gray-600">Sync</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleManualSync}
            disabled={!isOnline || !syncStatus?.sync_enabled || isSyncing}
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>

          <Button
            onClick={toggleSync}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {syncStatus?.sync_enabled ? 'Disable' : 'Enable'} Sync
          </Button>

          {syncStatus?.conflict_notes.length > 0 && (
            <Button
              onClick={onConflictResolution}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Resolve Conflicts
            </Button>
          )}
        </div>

        {/* Sync Info */}
        {syncStatus?.sync_enabled && (
          <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
            <div>✓ AES-256-GCM encrypted sync to Firebase</div>
            <div>✓ Quebec Law 25 compliance maintained</div>
            <div>✓ Automatic conflict detection</div>
            <div>Collection: {syncStatus.firebase_collection}</div>
          </div>
        )}

        {!syncStatus?.sync_enabled && (
          <div className="text-xs text-orange-600 p-2 bg-orange-50 rounded">
            ⚠️ Sync is disabled. Notes will only be stored locally until sync is enabled.
          </div>
        )}

        {!isOnline && (
          <div className="text-xs text-blue-600 p-2 bg-blue-50 rounded">
            ℹ️ You're offline. Notes will be saved locally and synced when connection is restored.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
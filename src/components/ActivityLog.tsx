import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Calendar, User, Package, Plus, Minus, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ActivityEntry {
  id?: string;
  type: 'in' | 'out' | 'create' | 'update' | 'delete';
  articleNumber: string;
  articleName: string;
  quantity?: number;
  reason?: string;
  user: string;
  timestamp: string;
  newStock?: number;
  oldStock?: number;
  details?: Record<string, any>;
}

const ActivityLog = () => {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'create' | 'update' | 'delete'>('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityEntry | null>(null);

  // Aktivitäten laden
  useEffect(() => {
    const loadActivities = () => {
      const stockActivities = JSON.parse(localStorage.getItem('stockActivities') || '[]');
      const articleActivities = JSON.parse(localStorage.getItem('articleActivities') || '[]');
      
      // Kombiniere alle Aktivitäten
      const allActivities = [...stockActivities, ...articleActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 200); // Letzte 200 Aktivitäten

      setActivities(allActivities);
    };

    loadActivities();
    
    // Event Listener für Storage-Änderungen
    const handleStorageChange = () => {
      loadActivities();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Eindeutige Benutzer extrahieren
  const uniqueUsers = [...new Set(activities.map(a => a.user))];

  // Aktivitäten filtern
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.articleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesUser = filterUser === 'all' || activity.user === filterUser;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const activityDate = new Date(activity.timestamp);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          matchesDate = activityDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = activityDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = activityDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesUser && matchesDate;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <Plus className="h-4 w-4" />;
      case 'out':
        return <Minus className="h-4 w-4" />;
      case 'create':
        return <Package className="h-4 w-4" />;
      case 'update':
        return <Activity className="h-4 w-4" />;
      case 'delete':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'in':
        return <Badge variant="default" className="bg-green-500">Zugang</Badge>;
      case 'out':
        return <Badge variant="destructive">Abgang</Badge>;
      case 'create':
        return <Badge variant="default" className="bg-blue-500">Erstellt</Badge>;
      case 'update':
        return <Badge variant="secondary">Bearbeitet</Badge>;
      case 'delete':
        return <Badge variant="destructive">Gelöscht</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const exportActivities = () => {
    try {
      const csvContent = [
        ['Zeitstempel', 'Typ', 'Artikel-Nr.', 'Artikel-Name', 'Menge', 'Grund', 'Benutzer', 'Neuer Bestand'].join(','),
        ...filteredActivities.map(activity => [
          activity.timestamp,
          activity.type,
          activity.articleNumber,
          activity.articleName,
          activity.quantity || '',
          activity.reason || '',
          activity.user,
          activity.newStock || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `aktivitaetsprotokoll_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      toast({
        title: "Export erfolgreich",
        description: "Aktivitätsprotokoll wurde als CSV-Datei heruntergeladen",
      });
    } catch (error) {
      toast({
        title: "Export-Fehler",
        description: "Aktivitätsprotokoll konnte nicht exportiert werden",
        variant: "destructive",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterUser('all');
    setDateRange('all');
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Aktivitätsprotokoll</h1>
        <p className="text-muted-foreground">Vollständige Nachverfolgung aller Lageraktivitäten</p>
      </div>

      {/* Filter und Suche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filter & Suche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Suche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Aktivitätstyp */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                <SelectItem value="in">Zugang</SelectItem>
                <SelectItem value="out">Abgang</SelectItem>
                <SelectItem value="create">Artikel erstellt</SelectItem>
                <SelectItem value="update">Artikel bearbeitet</SelectItem>
                <SelectItem value="delete">Artikel gelöscht</SelectItem>
              </SelectContent>
            </Select>

            {/* Benutzer */}
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger>
                <SelectValue placeholder="Benutzer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Benutzer</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Zeitraum */}
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Zeitraum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Zeiten</SelectItem>
                <SelectItem value="today">Heute</SelectItem>
                <SelectItem value="week">Letzte Woche</SelectItem>
                <SelectItem value="month">Letzter Monat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Filter zurücksetzen
            </Button>
            <Button variant="outline" size="sm" onClick={exportActivities}>
              <Download className="h-4 w-4 mr-2" />
              Als CSV exportieren
            </Button>
            <div className="ml-auto text-sm text-muted-foreground flex items-center">
              {filteredActivities.length} von {activities.length} Aktivitäten
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktivitätenliste */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Aktivitäten
          </CardTitle>
          <CardDescription>
            Chronologische Auflistung aller Lageraktivitäten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Keine Aktivitäten gefunden</p>
                <p className="text-sm">Ändern Sie die Filter oder führen Sie erste Lageraktivitäten durch</p>
              </div>
            ) : (
              filteredActivities.map((activity, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getActivityBadge(activity.type)}
                          <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {activity.articleName}
                            <span className="text-muted-foreground ml-2">({activity.articleNumber})</span>
                          </p>
                          
                          {activity.quantity && (
                            <p className="text-sm text-muted-foreground">
                              Menge: {activity.quantity} Stück
                              {activity.newStock !== undefined && (
                                <span className="ml-2">
                                  • Neuer Bestand: {activity.newStock}
                                </span>
                              )}
                            </p>
                          )}
                          
                          {activity.reason && (
                            <p className="text-sm text-muted-foreground italic">
                              Grund: {activity.reason}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {activity.user}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {activity.details && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedActivity(activity)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Aktivitäts-Details</DialogTitle>
                            <DialogDescription>
                              Detaillierte Informationen zur Aktivität
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="font-medium">Zeitstempel:</Label>
                                <p>{activity.timestamp}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Typ:</Label>
                                <p>{getActivityBadge(activity.type)}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Artikel:</Label>
                                <p>{activity.articleName}</p>
                              </div>
                              <div>
                                <Label className="font-medium">Benutzer:</Label>
                                <p>{activity.user}</p>
                              </div>
                            </div>
                            
                            {activity.details && (
                              <div>
                                <Label className="font-medium">Zusätzliche Details:</Label>
                                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(activity.details, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLog;
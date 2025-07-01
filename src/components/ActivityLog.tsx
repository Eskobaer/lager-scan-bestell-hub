
import React, { useState } from 'react';
import { Clock, User, Package, ArrowUpDown, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'in' | 'out' | 'count' | 'order';
  article: string;
  articleNumber: string;
  quantity: number;
  location: string;
  notes?: string;
}

const ActivityLog = () => {
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const logEntries: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-01-03 14:30:22',
      user: 'Max Mustermann',
      action: 'out',
      article: 'Schrauben M8x20',
      articleNumber: 'SCR-M8-20',
      quantity: 25,
      location: 'Regal A-12',
      notes: 'Für Projekt XY-123'
    },
    {
      id: '2',
      timestamp: '2025-01-03 13:15:45',
      user: 'Anna Schmidt',
      action: 'in',
      article: 'Kabelbinder 200mm',
      articleNumber: 'KAB-200-SW',
      quantity: 500,
      location: 'Regal C-08',
      notes: 'Neue Lieferung'
    },
    {
      id: '3',
      timestamp: '2025-01-03 11:20:10',
      user: 'Thomas Weber',
      action: 'count',
      article: 'Dichtungsringe',
      articleNumber: 'DIC-STD-01',
      quantity: 12,
      location: 'Regal B-05',
      notes: 'Inventur'
    },
    {
      id: '4',
      timestamp: '2025-01-03 09:45:33',
      user: 'System',
      action: 'order',
      article: 'Schrauben M8x20',
      articleNumber: 'SCR-M8-20',
      quantity: 100,
      location: 'Regal A-12',
      notes: 'Automatische Bestellung bei Unterschreitung Mindestbestand'
    },
    {
      id: '5',
      timestamp: '2025-01-02 16:10:28',
      user: 'Lisa Müller',
      action: 'out',
      article: 'Dichtungsringe',
      articleNumber: 'DIC-STD-01',
      quantity: 15,
      location: 'Regal B-05'
    }
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'in':
        return <Badge className="bg-green-100 text-green-800">Eingang</Badge>;
      case 'out':
        return <Badge className="bg-red-100 text-red-800">Ausgang</Badge>;
      case 'count':
        return <Badge className="bg-blue-100 text-blue-800">Inventur</Badge>;
      case 'order':
        return <Badge className="bg-purple-100 text-purple-800">Bestellung</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'in':
        return <ArrowUpDown className="h-4 w-4 text-green-600 rotate-180" />;
      case 'out':
        return <ArrowUpDown className="h-4 w-4 text-red-600" />;
      case 'count':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'order':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredEntries = logEntries.filter(entry => {
    if (filterType !== 'all' && entry.action !== filterType) return false;
    if (filterUser !== 'all' && entry.user !== filterUser) return false;
    return true;
  });

  const users = [...new Set(logEntries.map(entry => entry.user))];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Aktivitätsprotokoll</h1>
        <p className="text-gray-600">Alle Lagerbewegungen und -aktivitäten im Überblick</p>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Aktivitätstyp</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Aktivitäten</SelectItem>
                  <SelectItem value="in">Nur Eingänge</SelectItem>
                  <SelectItem value="out">Nur Ausgänge</SelectItem>
                  <SelectItem value="count">Nur Inventur</SelectItem>
                  <SelectItem value="order">Nur Bestellungen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Benutzer</label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Benutzer</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user} value={user}>{user}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktivitätsliste */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getActionIcon(entry.action)}
                </div>
                
                {/* Hauptinhalt */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionBadge(entry.action)}
                        <span className="text-sm text-gray-500">
                          {entry.timestamp}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900">
                        {entry.article} ({entry.articleNumber})
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {entry.action === 'out' ? '-' : '+'}{entry.quantity}
                      </div>
                      <div className="text-sm text-gray-500">Stück</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {entry.user}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {entry.location}
                    </div>
                    {entry.notes && (
                      <div className="md:col-span-1">
                        <span className="font-medium">Notiz: </span>
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Keine Aktivitäten gefunden
            </h3>
            <p className="text-gray-600">
              Für die ausgewählten Filter wurden keine Aktivitäten gefunden.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityLog;

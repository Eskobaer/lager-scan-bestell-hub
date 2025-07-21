
import React from 'react';
import { Package, AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const stats = [
    {
      title: "Artikel im Lager",
      value: "234",
      change: "+12 diese Woche",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Kritische Bestände",
      value: "8",
      change: "Sofortige Bestellung nötig",
      icon: AlertTriangle,
      color: "text-red-600"
    },
    {
      title: "Bewegungen heute",
      value: "47",
      change: "+18% vs. gestern",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Aktive Nutzer",
      value: "12",
      change: "Mitarbeiter online",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  const criticalItems = [
    { name: "Schrauben M8x20", current: 5, minimum: 50, articleNumber: "SCR-M8-20" },
    { name: "Dichtungsringe", current: 12, minimum: 100, articleNumber: "DIC-STD-01" },
    { name: "Kabelbinder 200mm", current: 23, minimum: 200, articleNumber: "KAB-200-SW" }
  ];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Lager Dashboard</h1>
        <p className="text-muted-foreground">Übersicht über Ihr digitales Lagersystem</p>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kritische Bestände */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Kritische Bestände - Sofort bestellen!
          </CardTitle>
          <CardDescription>
            Artikel, die unter der Mindestmenge liegen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">Art.-Nr.: {item.articleNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-destructive">
                    {item.current} / {item.minimum} Stk.
                  </p>
                  <p className="text-xs text-muted-foreground">Bestand / Minimum</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

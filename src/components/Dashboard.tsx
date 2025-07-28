
import React from 'react';
import { Package, AlertTriangle, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useArticles, useStockBookings, useActivities } from '@/hooks/useDatabaseLazy';

const Dashboard = () => {
  const navigate = useNavigate();
  const { articles, loading: articlesLoading } = useArticles();
  const { bookings, loading: bookingsLoading } = useStockBookings();
  const { activities, loading: activitiesLoading } = useActivities();

  // Berechne echte Statistiken
  const totalArticles = articles.length;
  const criticalItems = articles.filter(article => 
    article.currentStock <= article.minimumStock
  );
  const criticalCount = criticalItems.length;

  // Bewegungen heute berechnen
  const today = new Date().toDateString();
  const todaysBookings = bookings.filter(booking => 
    new Date(booking.timestamp).toDateString() === today
  );
  const todaysMovements = todaysBookings.length;

  // Bewegungen gestern für Vergleich
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdaysBookings = bookings.filter(booking => 
    new Date(booking.timestamp).toDateString() === yesterday.toDateString()
  );
  const yesterdaysMovements = yesterdaysBookings.length;
  
  const movementChange = yesterdaysMovements > 0 
    ? Math.round(((todaysMovements - yesterdaysMovements) / yesterdaysMovements) * 100)
    : 0;

  // Aktive Nutzer (letzte 24 Stunden)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const recentActivities = activities.filter(activity => 
    new Date(activity.timestamp) > oneDayAgo
  );
  const activeUsers = new Set(recentActivities.map(activity => activity.user)).size;

  const stats = [
    {
      title: "Artikel im Lager",
      value: articlesLoading ? "..." : totalArticles.toString(),
      change: `${totalArticles} Artikel erfasst`,
      icon: Package,
      color: "text-blue-600",
      onClick: () => navigate('/article-management')
    },
    {
      title: "Kritische Bestände",
      value: articlesLoading ? "..." : criticalCount.toString(),
      change: criticalCount > 0 ? "Sofortige Bestellung nötig" : "Alle Bestände okay",
      icon: AlertTriangle,
      color: criticalCount > 0 ? "text-red-600" : "text-green-600",
      onClick: () => {
        // Scroll zu kritischen Beständen auf der gleichen Seite
        document.getElementById('critical-items')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Bewegungen heute",
      value: bookingsLoading ? "..." : todaysMovements.toString(),
      change: movementChange > 0 ? `+${movementChange}% vs. gestern` : 
              movementChange < 0 ? `${movementChange}% vs. gestern` : 
              "Gleich wie gestern",
      icon: TrendingUp,
      color: movementChange >= 0 ? "text-green-600" : "text-red-600",
      onClick: () => navigate('/stock-bookings')
    },
    {
      title: "Aktive Nutzer",
      value: activitiesLoading ? "..." : activeUsers.toString(),
      change: "Nutzer (letzte 24h)",
      icon: Users,
      color: "text-purple-600",
      onClick: () => navigate('/activity-log')
    }
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
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2 hover:border-primary/50"
              onClick={stat.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
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
      <Card id="critical-items">
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
            {articlesLoading ? (
              <div className="text-center py-4">Lade Daten...</div>
            ) : criticalItems.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Keine kritischen Bestände - alle Artikel haben ausreichend Lagerbestand! 🎉
              </div>
            ) : (
              criticalItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border-l-4 border-destructive">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">Art.-Nr.: {item.articleNumber}</p>
                    <p className="text-xs text-muted-foreground">Lagerort: {item.location}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive">
                        {item.currentStock} / {item.minimumStock} Stk.
                      </p>
                      <p className="text-xs text-muted-foreground">Bestand / Minimum</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate('/stock-bookings', { state: { selectedArticle: item.articleNumber } })}
                      className="whitespace-nowrap"
                    >
                      Einbuchen
                    </Button>
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

export default Dashboard;

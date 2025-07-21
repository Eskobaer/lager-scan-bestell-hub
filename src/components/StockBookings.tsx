import React, { useState } from 'react';
import { Package, Plus, Minus, Search, Filter, Calendar, User, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useArticles, useStockBookings } from '@/hooks/useDatabase';

const StockBookings = () => {
  const { articles, loading: articlesLoading } = useArticles();
  const { bookings, loading: bookingsLoading, createBooking } = useStockBookings();
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [formData, setFormData] = useState({
    type: 'out' as 'in' | 'out',
    articleNumber: '',
    quantity: 1,
    reason: '',
    user: 'Demo User'
  });

  const handleArticleSelect = (articleNumber: string) => {
    const article = articles.find(a => a.articleNumber === articleNumber);
    setSelectedArticle(article || null);
    setFormData(prev => ({ ...prev, articleNumber }));
  };

  const processBooking = async () => {
    if (!selectedArticle || !formData.quantity || formData.quantity <= 0) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte wählen Sie einen Artikel und geben Sie eine gültige Menge ein",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBooking({
        type: formData.type,
        articleNumber: formData.articleNumber,
        quantity: formData.quantity,
        reason: formData.reason,
        user: formData.user
      });

      toast({
        title: `${formData.type === 'in' ? 'Zugang' : 'Abgang'} erfasst`,
        description: `${formData.quantity}x ${selectedArticle.name} wurde erfolgreich gebucht`,
      });

      // Form zurücksetzen
      setFormData({
        type: 'out',
        articleNumber: '',
        quantity: 1,
        reason: '',
        user: 'Demo User'
      });
      setSelectedArticle(null);
    } catch (error: any) {
      toast({
        title: "Buchungsfehler",
        description: error.message || "Buchung konnte nicht durchgeführt werden",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.articleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.articleNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || booking.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Bestandsbuchungen</h1>
        <p className="text-muted-foreground">Erfassen Sie Zu- und Abgänge für Lagerartikel</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Buchungsformular */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Neue Buchung
            </CardTitle>
            <CardDescription>
              Erfassen Sie Lagerbewegungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buchungstyp */}
            <div>
              <Label>Buchungstyp</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={formData.type === 'in' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'in' }))}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Zugang
                </Button>
                <Button
                  variant={formData.type === 'out' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'out' }))}
                >
                  <Minus className="h-4 w-4 mr-1" />
                  Abgang
                </Button>
              </div>
            </div>

            {/* Artikel auswählen */}
            <div className="space-y-2">
              <Label htmlFor="article">Artikel</Label>
              <Select value={formData.articleNumber} onValueChange={handleArticleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Artikel auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {articles.map((article) => (
                    <SelectItem key={article.articleNumber} value={article.articleNumber}>
                      {article.name} ({article.articleNumber}) - Bestand: {article.currentStock}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Artikel-Details */}
            {selectedArticle && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Aktueller Bestand:</span>
                  <span className="text-sm">{selectedArticle.currentStock} Stück</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Mindestbestand:</span>
                  <span className="text-sm">{selectedArticle.minimumStock} Stück</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Hersteller:</span>
                  <span className="text-sm">{selectedArticle.manufacturer}</span>
                </div>
                {selectedArticle.currentStock <= selectedArticle.minimumStock && (
                  <Badge variant="destructive" className="text-xs">
                    Mindestbestand unterschritten!
                  </Badge>
                )}
              </div>
            )}

            {/* Menge */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Menge</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={formData.type === 'out' ? selectedArticle?.currentStock : undefined}
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 1 
                }))}
              />
            </div>

            {/* Grund */}
            <div className="space-y-2">
              <Label htmlFor="reason">Grund</Label>
              <Textarea
                id="reason"
                placeholder="z.B. Produktion, Reparatur, Lieferung, Inventur..."
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Benutzer */}
            <div className="space-y-2">
              <Label htmlFor="user">Benutzer</Label>
              <Input
                id="user"
                value={formData.user}
                onChange={(e) => setFormData(prev => ({ ...prev, user: e.target.value }))}
              />
            </div>

            <Button 
              onClick={processBooking} 
              className="w-full" 
              size="lg"
              disabled={!selectedArticle}
            >
              <FileText className="h-4 w-4 mr-2" />
              Buchung durchführen
            </Button>
          </CardContent>
        </Card>

        {/* Buchungshistorie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Buchungshistorie
            </CardTitle>
            <CardDescription>
              Letzte Lagerbewegungen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nach Artikel suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={(value: 'all' | 'in' | 'out') => setFilterType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  <SelectItem value="in">Zugang</SelectItem>
                  <SelectItem value="out">Abgang</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buchungsliste */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {bookingsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
                  <p>Buchungen werden geladen...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Keine Buchungen gefunden</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <div key={booking.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {booking.type === 'in' ? (
                          <Badge variant="default" className="bg-green-500">
                            <Plus className="h-3 w-3 mr-1" />
                            Zugang
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <Minus className="h-3 w-3 mr-1" />
                            Abgang
                          </Badge>
                        )}
                        <span className="font-medium text-sm">{booking.quantity}x</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{booking.timestamp}</span>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm">{booking.articleName}</p>
                      <p className="text-xs text-muted-foreground">Art.-Nr.: {booking.articleNumber}</p>
                    </div>
                    
                    {booking.reason && (
                      <p className="text-xs text-muted-foreground italic">{booking.reason}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {booking.user}
                      </span>
                      <span>
                        Bestand: {booking.oldStock} → {booking.newStock}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StockBookings;
import React, { useState, useEffect } from 'react';
import { Mail, Settings, Save, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  toEmail: string;
}

const EmailSettings = () => {
  const [config, setConfig] = useState<EmailConfig>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    toEmail: 'eskobaer@gmail.com'
  });
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Konfiguration
    const savedConfig = localStorage.getItem('emailConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSave = () => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      toast({
        title: "Unvollständige Konfiguration",
        description: "Bitte füllen Sie alle Felder aus.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('emailConfig', JSON.stringify(config));
    toast({
      title: "E-Mail-Einstellungen gespeichert",
      description: "Die Konfiguration wurde erfolgreich gespeichert.",
    });
  };

  const handleTestEmail = async () => {
    if (!config.serviceId || !config.templateId || !config.publicKey) {
      toast({
        title: "Konfiguration unvollständig",
        description: "Bitte speichern Sie zuerst eine vollständige Konfiguration.",
        variant: "destructive",
      });
      return;
    }

    // Test-E-Mail senden
    const { EmailService } = await import('@/services/emailService');
    const success = await EmailService.sendTestEmail();
    
    if (success) {
      toast({
        title: "Test-E-Mail gesendet",
        description: "Die Test-E-Mail wurde erfolgreich an " + config.toEmail + " gesendet.",
      });
    } else {
      toast({
        title: "Fehler",
        description: "Test-E-Mail konnte nicht gesendet werden. Überprüfen Sie Ihre Konfiguration.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <Mail className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">E-Mail-Einstellungen</h1>
          <p className="text-muted-foreground">Konfiguration für automatische Mindestbestand-Benachrichtigungen</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            EmailJS Konfiguration
          </CardTitle>
          <CardDescription>
            Konfigurieren Sie EmailJS für das Versenden von E-Mail-Benachrichtigungen bei Mindestbestand.
            <br />
            <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Erstellen Sie einen kostenlosen EmailJS Account
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service ID</Label>
              <Input
                id="serviceId"
                type={showKeys ? "text" : "password"}
                placeholder="Ihre EmailJS Service ID"
                value={config.serviceId}
                onChange={(e) => setConfig(prev => ({ ...prev, serviceId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateId">Template ID</Label>
              <Input
                id="templateId"
                type={showKeys ? "text" : "password"}
                placeholder="Ihre EmailJS Template ID"
                value={config.templateId}
                onChange={(e) => setConfig(prev => ({ ...prev, templateId: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicKey">Public Key</Label>
            <div className="relative">
              <Input
                id="publicKey"
                type={showKeys ? "text" : "password"}
                placeholder="Ihr EmailJS Public Key"
                value={config.publicKey}
                onChange={(e) => setConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKeys(!showKeys)}
              >
                {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toEmail">Empfänger E-Mail</Label>
            <Input
              id="toEmail"
              type="email"
              placeholder="E-Mail-Adresse für Benachrichtigungen"
              value={config.toEmail}
              onChange={(e) => setConfig(prev => ({ ...prev, toEmail: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Speichern
            </Button>
            <Button variant="outline" onClick={handleTestEmail} className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Test-E-Mail senden
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EmailJS Setup-Anleitung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. EmailJS Account erstellen</h4>
            <p className="text-sm text-muted-foreground">
              Gehen Sie zu <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">emailjs.com</a> und erstellen Sie einen kostenlosen Account.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">2. E-Mail-Service hinzufügen</h4>
            <p className="text-sm text-muted-foreground">
              Fügen Sie einen E-Mail-Service hinzu (z.B. Gmail, Outlook) und notieren Sie sich die Service ID.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">3. E-Mail-Template erstellen</h4>
            <p className="text-sm text-muted-foreground">
              Erstellen Sie ein Template mit folgenden Variablen: 
              <code className="bg-muted px-1 rounded">article_name</code>, 
              <code className="bg-muted px-1 rounded">current_stock</code>, 
              <code className="bg-muted px-1 rounded">minimum_stock</code>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">4. Public Key kopieren</h4>
            <p className="text-sm text-muted-foreground">
              Gehen Sie zu Account → API Keys und kopieren Sie Ihren Public Key.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSettings;
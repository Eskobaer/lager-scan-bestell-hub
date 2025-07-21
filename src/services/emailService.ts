import emailjs from '@emailjs/browser';

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  toEmail: string;
}

interface StockAlertData {
  articleName: string;
  articleNumber: string;
  currentStock: number;
  minimumStock: number;
  location: string;
}

export class EmailService {
  private static getConfig(): EmailConfig | null {
    const configStr = localStorage.getItem('emailConfig');
    if (!configStr) return null;
    
    try {
      return JSON.parse(configStr);
    } catch {
      return null;
    }
  }

  static async sendStockAlert(stockData: StockAlertData): Promise<boolean> {
    const config = this.getConfig();
    if (!config) {
      console.warn('E-Mail-Konfiguration nicht gefunden. Bitte konfigurieren Sie EmailJS in den Einstellungen.');
      return false;
    }

    try {
      // EmailJS initialisieren
      emailjs.init(config.publicKey);

      // Template-Parameter für EmailJS
      const templateParams = {
        to_email: config.toEmail,
        article_name: stockData.articleName,
        article_number: stockData.articleNumber,
        current_stock: stockData.currentStock.toString(),
        minimum_stock: stockData.minimumStock.toString(),
        location: stockData.location,
        alert_date: new Date().toLocaleDateString('de-DE'),
        alert_time: new Date().toLocaleTimeString('de-DE')
      };

      // E-Mail senden
      await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams
      );

      console.log('Mindestbestand-Benachrichtigung erfolgreich gesendet:', stockData.articleName);
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      return false;
    }
  }

  static async sendTestEmail(): Promise<boolean> {
    const testData: StockAlertData = {
      articleName: 'Test Artikel',
      articleNumber: 'TEST-001',
      currentStock: 5,
      minimumStock: 10,
      location: 'Testlager'
    };

    return this.sendStockAlert(testData);
  }

  static isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config?.serviceId && config?.templateId && config?.publicKey && config?.toEmail);
  }
}
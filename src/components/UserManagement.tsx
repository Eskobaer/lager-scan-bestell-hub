import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { database, User } from '@/lib/database';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Users, UserCheck, UserX } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user' as User['role'],
    email: '',
    firstName: '',
    lastName: '',
    isActive: true
  });
  const { user: currentUser, isSuperAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      await database.init();
      const allUsers = database.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Benutzer konnten nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'user',
      email: '',
      firstName: '',
      lastName: '',
      isActive: true
    });
    setEditingUser(null);
  };

  const handleCreate = async () => {
    try {
      if (!formData.username || !formData.password) {
        toast({
          title: "Validation Fehler",
          description: "Benutzername und Passwort sind erforderlich.",
          variant: "destructive",
        });
        return;
      }

      database.createUser(formData);
      await loadUsers();
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Benutzer erstellt",
        description: `Benutzer ${formData.username} wurde erfolgreich erstellt.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht erstellt werden.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isActive: user.isActive
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    try {
      database.updateUser(editingUser.id, formData);
      await loadUsers();
      setEditingUser(null);
      resetForm();
      
      toast({
        title: "Benutzer aktualisiert",
        description: `Benutzer ${formData.username} wurde erfolgreich aktualisiert.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string, username: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Fehler",
        description: "Sie können sich nicht selbst löschen.",
        variant: "destructive",
      });
      return;
    }

    try {
      database.deleteUser(userId);
      await loadUsers();
      
      toast({
        title: "Benutzer gelöscht",
        description: `Benutzer ${username} wurde erfolgreich gelöscht.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Benutzer konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'admin': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (role: User['role']) => {
    switch (role) {
      case 'superadmin': return 'Super Admin';
      case 'admin': return 'Administrator';
      default: return 'Benutzer';
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Zugriff verweigert</h3>
              <p className="text-muted-foreground">
                Sie haben keine Berechtigung, auf die Benutzerverwaltung zuzugreifen.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Benutzerverwaltung
          </h1>
          <p className="text-muted-foreground mt-1">
            Verwalten Sie Benutzerkonten und Berechtigungen
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Benutzer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Benutzer für das System.
              </DialogDescription>
            </DialogHeader>
            <UserForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isEdit={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Benutzer</CardTitle>
          <CardDescription>
            Übersicht aller registrierten Benutzer im System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benutzername</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Letzte Anmeldung</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    {user.firstName || user.lastName 
                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <div className="flex items-center gap-1 text-success">
                        <UserCheck className="h-4 w-4" />
                        Aktiv
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UserX className="h-4 w-4" />
                        Inaktiv
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleString('de-DE')
                      : 'Nie'
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Benutzer bearbeiten</DialogTitle>
                            <DialogDescription>
                              Bearbeiten Sie die Benutzerdaten und Berechtigungen.
                            </DialogDescription>
                          </DialogHeader>
                          <UserForm 
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingUser(null)}
                            isEdit={true}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      {user.id !== currentUser?.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
                              <AlertDialogDescription>
                                Sind Sie sicher, dass Sie den Benutzer "{user.username}" löschen möchten? 
                                Diese Aktion kann nicht rückgängig gemacht werden.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(user.id, user.username)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Löschen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

interface UserFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

const UserForm = ({ formData, setFormData, onSubmit, onCancel, isEdit }: UserFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Benutzername *</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="Benutzername eingeben"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Passwort *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Passwort eingeben"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            placeholder="Vorname eingeben"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            placeholder="Nachname eingeben"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="E-Mail eingeben"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="role">Rolle</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value) => setFormData({...formData, role: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Benutzer</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="superadmin">Super Administrator</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
        />
        <Label htmlFor="isActive">Benutzer ist aktiv</Label>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="button" onClick={onSubmit}>
          {isEdit ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </div>
  );
};

export default UserManagement;
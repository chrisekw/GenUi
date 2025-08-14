
'use client';

import * as React from 'react';
import { getAllUsers, updateUserPlan, deleteUser } from './actions';
import type { UserProfile, PlanId } from '@/lib/user-profile';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Edit, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const planColors: Record<PlanId, string> = {
    Free: 'bg-gray-500',
    Pro: 'bg-blue-500',
    Studio: 'bg-purple-500',
    Enterprise: 'bg-red-500'
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  // State for dialogs
  const [userToDelete, setUserToDelete] = React.useState<UserProfile | null>(null);
  const [userToEdit, setUserToEdit] = React.useState<UserProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = React.useState<PlanId>('Free');

  React.useEffect(() => {
    async function fetchUsers() {
      try {
        const userList = await getAllUsers();
        setUsers(userList);
      } catch (error) {
        toast({ title: 'Failed to load users', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [toast]);

  const handleEditClick = (user: UserProfile) => {
    setUserToEdit(user);
    setSelectedPlan(user.planId);
  }

  const handleUpdatePlan = () => {
    if (!userToEdit) return;

    startTransition(async () => {
        const result = await updateUserPlan({ uid: userToEdit.uid, planId: selectedPlan });
        if (result.success) {
            setUsers(users.map(u => u.uid === userToEdit.uid ? { ...u, planId: selectedPlan } : u));
            toast({ title: 'User plan updated successfully!' });
            setUserToEdit(null);
        } else {
            toast({ title: 'Failed to update user plan', variant: 'destructive' });
        }
    });
  }

  const handleDeleteClick = (user: UserProfile) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    startTransition(async () => {
        const result = await deleteUser(userToDelete.uid);
        if (result.success) {
            setUsers(users.filter(u => u.uid !== userToDelete.uid));
            toast({ title: 'User deleted successfully' });
        } else {
            toast({ title: 'Failed to delete user', description: result.message, variant: 'destructive' });
        }
        setUserToDelete(null);
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all users in your system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.photoURL ?? ''} />
                            <AvatarFallback>{user.displayName?.[0] ?? user.email[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.displayName || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${planColors[user.planId]} text-white`}>{user.planId}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(user)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user's document from Firestore. To fully delete the user, you must also remove them from Firebase Authentication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
                {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Plan Dialog */}
        <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit User Plan</DialogTitle>
                <DialogDescription>
                    Change the subscription plan for {userToEdit?.email}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan" className="text-right">Plan</Label>
                    <Select value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as PlanId)}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Free">Free</SelectItem>
                            <SelectItem value="Pro">Pro</SelectItem>
                            <SelectItem value="Studio">Studio</SelectItem>
                            <SelectItem value="Enterprise">Enterprise</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setUserToEdit(null)} disabled={isPending}>Cancel</Button>
                <Button onClick={handleUpdatePlan} disabled={isPending}>
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    </>
  );
}

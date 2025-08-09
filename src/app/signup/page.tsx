
'use client';

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { user, signUpWithEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const methods = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });
  const { control, handleSubmit, formState: { errors } } = methods;


  React.useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);
  
  const handleSignup = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      await signUpWithEmail(data.email, data.password);
      toast({
        title: 'Signup successful!',
        description: 'Welcome! You can now sign in.',
      });
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Signup failed',
        description: error.message || 'Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => <Input id="email" type="email" placeholder="m@example.com" {...field} />}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                 <Controller
                    name="password"
                    control={control}
                    render={({ field }) => <Input id="password" type="password" {...field} />}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
               <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                 <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => <Input id="confirmPassword" type="password" {...field} />}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}


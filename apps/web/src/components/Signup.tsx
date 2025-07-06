import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Upload, X, Loader2 } from 'lucide-react';

// Shadcn/UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from 'next/navigation';
import { Separator } from "@/components/ui/separator";
import { signupService } from '@/services/auth';
import { Alert } from './ui/alert';
import { toast } from 'sonner';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    image: null,
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const router = useRouter()

  const handleInputChange = async(e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

  
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, image: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    document.getElementById('image').value = ''; // Reset file input
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    const res = await signupService(formData)
    console.log("POP",res)
    if(res.success){
     toast(res.data.message);
     localStorage.setItem("token",res.data.token)
      router.push("/");
    }else{
     toast(res.message)
    }
    setIsLoading(false);

   
    
  
  };

  return (
    <div className="bg-zinc-950 flex items-center justify-center min-h-screen p-4 overflow-y-auto">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-white shadow-lg shadow-zinc-950/50">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-black" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center text-zinc-400">
            Fill in your details to join our community.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-zinc-300">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input id="username" name="username" placeholder="e.g. john_doe" value={formData.username} onChange={handleInputChange} className={`pl-10 bg-zinc-800 border-zinc-700 focus:border-white ${errors.username && 'border-red-500'}`} />
              </div>
              {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} className={`pl-10 bg-zinc-800 border-zinc-700 focus:border-white ${errors.email && 'border-red-500'}`} />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleInputChange} className={`pl-10 pr-10 bg-zinc-800 border-zinc-700 focus:border-white ${errors.password && 'border-red-500'}`} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-zinc-500 hover:bg-zinc-700 hover:text-white">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>
            
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Profile Picture (Optional)</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 border-2 border-zinc-700">
                    <AvatarImage src={imagePreview} alt="Profile Picture Preview" />
                    <AvatarFallback className="bg-zinc-800">
                      <User className="h-7 w-7 text-zinc-500" />
                    </AvatarFallback>
                  </Avatar>
                  {imagePreview && (
                    <Button type="button" variant="destructive" size="icon" onClick={removeImage} className="absolute -top-1 -right-1 h-6 w-6 rounded-full">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                    <Button asChild variant="outline" className="w-full border-zinc-700 text-zinc-900 hover:bg-zinc-800 hover:text-white cursor-pointer">
                        <label htmlFor="image">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </label>
                    </Button>
                    <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              </div>
              {errors.image && <p className="text-xs text-red-400">{errors.image}</p>}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="agreeTerms" checked={formData.agreeTerms} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeTerms: checked }))} className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-black" />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="agreeTerms" className="text-sm font-medium leading-none text-zinc-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the <a href="#" className="text-white font-semibold hover:underline">Terms</a> & <a href="#" className="text-white font-semibold hover:underline">Privacy Policy</a>.
                </label>
                {errors.agreeTerms && <p className="text-xs text-red-400">{errors.agreeTerms}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full bg-white text-black font-bold hover:bg-zinc-200" disabled={isLoading}>
              {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>) : ('Create Account')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-zinc-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full border-zinc-700 text-zinc-800 hover:bg-zinc-800 hover:text-white">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.434,36.33,48,30.825,48,24C48,22.659,47.862,21.35,47.611,20.083z"></path></svg>
            Google
          </Button>
        </CardContent>
        
        <CardFooter>
          <p className="w-full text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <a href="#" className="text-white font-semibold hover:underline">
              Sign In
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
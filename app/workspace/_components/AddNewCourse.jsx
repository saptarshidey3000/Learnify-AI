import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BrainCircuitIcon, Loader2Icon, Sparkle, ImageIcon, Link2Icon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import axios from 'axios'
import { useRouter } from 'next/navigation'


function AddNewCourse({ children }) {
  const [loading, setLoading] = useState(false);
  
  // 🆕 Added banner image options
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chapter: 1,
    includevideo: false,
    category: '',
    level: '',
    bannerImageOption: 'ai', // 🆕 'ai' or 'custom'
    customBannerUrl: '' // 🆕 URL when user chooses custom
  });

  const router = useRouter();

  const onHandleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData]);

  const onGenerate = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.category || !formData.level) {
        alert('Please fill in Course Name, Category, and Difficulty Level');
        return;
      }

      // 🆕 Validate custom banner URL if selected
      if (formData.bannerImageOption === 'custom' && !formData.customBannerUrl) {
        alert('Please provide a banner image URL');
        return;
      }

      // Prepare payload
      const payload = {
        name: formData.name,
        description: formData.description,
        chapter: Number(formData.chapter),
        includevideo: formData.includevideo,
        level: formData.level,
        category: Array.isArray(formData.category) 
          ? formData.category 
          : formData.category.split(',').map(c => c.trim()),
        bannerImageOption: formData.bannerImageOption, // 🆕
        customBannerUrl: formData.customBannerUrl // 🆕
      };

      console.log('📤 Sending payload:', payload);

      const result = await axios.post('/api/generate-layout-ai', payload);

      console.log("✅ AI Generated Course Layout:", result.data);

      if (result.data.success && result.data.course) {
        alert('Course generated successfully!');
        console.log('Course data:', result.data.course);
        router.push('/workspace/edit-course/' + result.data.courseId)
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          chapter: 1,
          includevideo: false,
          category: '',
          level: '',
          bannerImageOption: 'ai',
          customBannerUrl: ''
        });
      } else {
        console.warn('⚠️ Response received but no course data:', result.data);
        alert('Course generation incomplete. Check console for details.');
      }

    } catch (error) {
      console.error("💥 Error generating course:");
      console.error("Error response:", error.response?.data);
      console.error("Error message:", error.message);
      
      const errorMessage = error.response?.data?.details || error.message || 'Unknown error occurred';
      alert(`Failed to generate course: ${errorMessage}`);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="max-w-lg p-6 space-y-2 rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-semibold">
              Create your Course with AI
              <BrainCircuitIcon className="w-5 h-5 text-indigo-600" />
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to generate your course instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">

            {/* Course Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Course Name</label>
              <Input
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => onHandleInputChange('name', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Course Description (Optional)</label>
              <Input
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) => onHandleInputChange('description', e.target.value)}
              />
            </div>

            {/* Number of Chapters */}
            <div className="space-y-1">
              <label className="text-sm font-medium">No. of Chapters</label>
              <Input
                placeholder="No. of Chapters"
                type="number"
                value={formData.chapter}
                onChange={(e) => onHandleInputChange('chapter', Number(e.target.value))}
              />
            </div>

            {/* Include Video Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Video</label>
              <Switch
                checked={formData.includevideo}
                onCheckedChange={(checked) => onHandleInputChange('includevideo', checked)}
              />
            </div>

            {/* Difficulty Level */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select
                onValueChange={(value) => onHandleInputChange('level', value)}
                value={formData.level}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="Category (Separated by Comma)"
                value={formData.category}
                onChange={(e) => onHandleInputChange('category', e.target.value)}
              />
            </div>

            {/* 🆕 Banner Image Options */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Banner Image</label>
              <RadioGroup 
                value={formData.bannerImageOption}
                onValueChange={(value) => onHandleInputChange('bannerImageOption', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="ai" />
                  <Label htmlFor="ai" className="flex items-center gap-2 cursor-pointer">
                    <Sparkle className="w-4 h-4 text-indigo-600" />
                    Generate with AI
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
                    <Link2Icon className="w-4 h-4 text-blue-600" />
                    Use custom URL
                  </Label>
                </div>
              </RadioGroup>

              {/* 🆕 Show URL input only when custom is selected */}
              {formData.bannerImageOption === 'custom' && (
                <div className="mt-2">
                  <Input
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={formData.customBannerUrl}
                    onChange={(e) => onHandleInputChange('customBannerUrl', e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Make sure the URL is publicly accessible
                  </p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="pt-2">
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={onGenerate}
                disabled={loading}
              >
                {loading ? (
                  <Loader2Icon className='animate-spin' />
                ) : (
                  <Sparkle className="w-4 h-4" />
                )}
                {loading ? 'Generating...' : 'Generate Course'}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewCourse;
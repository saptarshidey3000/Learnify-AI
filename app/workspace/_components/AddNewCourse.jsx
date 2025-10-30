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
import { BrainCircuitIcon, Loader2Icon, Sparkle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { useRouter } from 'next/navigation'


// 🧠 This component handles the popup dialog for creating a new course using AI.
function AddNewCourse({ children }) {

  // 🔄 Controls the loading spinner during API calls
  const [loading, setLoading] = useState(false);

  // 🧾 Stores all form input data in a single object
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    chapter: 1,
    includevideo: false,
    category: '',
    level: ''
  });

  const router = useRouter();
  // 🧩 Generic function to update form fields dynamically
  // field → key name (e.g., 'name')
  // value → new value entered by user
  const onHandleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🧠 Debugging helper — logs whenever formData changes
  useEffect(() => {
    console.log("Form Data Updated:", formData);
  }, [formData]);

  // ⚙️ Function to call the AI API to generate course layout
// ⚙️ Function to call the AI API to generate course layout
const onGenerate = async () => {
  try {
    setLoading(true);

    // Validate required fields
    if (!formData.name || !formData.category || !formData.level) {
      alert('Please fill in Course Name, Category, and Difficulty Level');
      return;
    }

    // Prepare payload
    const payload = {
      ...formData,
      chapter: Number(formData.chapter),
      category: Array.isArray(formData.category) 
        ? formData.category 
        : formData.category.split(',').map(c => c.trim())
    };

    console.log('📤 Sending payload:', payload);

    // 🌐 API Call
    const result = await axios.post('/api/generate-layout-ai', payload);

    console.log("✅ AI Generated Course Layout:", result.data);

    if (result.data.success && result.data.course) {
      alert('Course generated successfully!');
      console.log('Course data:', result.data.course);
      router.push('/workspace/edit-course/'+result.data.courseId)
      // ✅ Reset form after success
      setFormData({
        name: '',
        description: '',
        chapter: 1,
        includevideo: false,
        category: '',
        level: ''
      });
    } else {
      console.warn('⚠️ Response received but no course data:', result.data);
      alert('Course generation incomplete. Check console for details.');
    }

  } catch (error) {
    console.error("💥 Error generating course:");
    console.error("Error response:", error.response?.data);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    // Show user-friendly error message
    const errorMessage = error.response?.data?.details || error.message || 'Unknown error occurred';
    alert(`Failed to generate course: ${errorMessage}`);
    
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      {/* Dialog — popup modal for creating new course */}
      <Dialog>
        {/* children lets parent component decide what triggers this dialog */}
        <DialogTrigger asChild>{children}</DialogTrigger>

        <DialogContent className="max-w-lg p-6 space-y-2 rounded-2xl">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-semibold">
              Create your Course with AI
              <BrainCircuitIcon className="w-5 h-5 text-indigo-600" />
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to generate your course instantly.
            </DialogDescription>
          </DialogHeader>

          {/* All Form Fields */}
          <div className="space-y-5">

            {/* 🏷️ Course Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Course Name</label>
              <Input
                placeholder="Course Name"
                value={formData.name}
                onChange={(e) => onHandleInputChange('name', e.target.value)}
              />
            </div>

            {/* 📝 Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Course Description (Optional)</label>
              <Input
                placeholder="Course Description"
                value={formData.description}
                onChange={(e) => onHandleInputChange('description', e.target.value)}
              />
            </div>

            {/* 📚 Number of Chapters */}
            <div className="space-y-1">
              <label className="text-sm font-medium">No. of Chapters</label>
              <Input
                placeholder="No. of Chapters"
                type="number"
                value={formData.chapter}
                onChange={(e) => onHandleInputChange('chapter', Number(e.target.value))}
              />
            </div>

            {/* 🎥 Include Video Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Video</label>
              <Switch
                checked={formData.includevideo}
                onCheckedChange={(checked) => onHandleInputChange('includevideo', checked)}
              />
            </div>

            {/* ⚡ Difficulty Level Dropdown */}
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

            {/* 🧭 Category Input */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="Category (Separated by Comma)"
                value={formData.category}
                onChange={(e) => onHandleInputChange('category', e.target.value)}
              />
            </div>

            {/* ⚙️ Generate Button */}
            <div className="pt-2">
              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={onGenerate}
                disabled={loading}
              >
                {/* Loader animation when generating */}
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

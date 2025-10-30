import React, { useState } from 'react'
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
import { BrainCircuitIcon, Sparkle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

function AddNewCourse({ children }) {

  //store all form input data dynamically
  const [formData, setFormData]=useState({
    name:'',
    description:'',
    chapter:1,
    includevideo:false,
    category:'',
    level:''
  });

  //function — to handle input updates for each field.
  const onHandleInputChange=(field,value)=>{
      setFormData(prev=>({
        ...prev,
        [field]:value
      }));
      console.log(formData);
  }

  const onGenerate=()=>{
    console.log(formData);
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-lg p-6 space-y-2 rounded-2xl">
          <DialogHeader className="space-y-2 text-center">
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-semibold">
              Create your Course with AI <BrainCircuitIcon className="w-5 h-5 text-indigo-600" />
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to generate your course instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Course Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Course Name</label>
              <Input placeholder="Course Name" onChange={(event)=>onHandleInputChange('name',event?.target.value)} />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Course Description (Optional)</label>
              <Input placeholder="Course Description" 
               onChange={(event)=>onHandleInputChange('description',event?.target.value)}  />
            </div>

            {/* Chapters */}
            <div className="space-y-1">
              <label className="text-sm font-medium">No. of Chapters</label>
              <Input placeholder="No. of Chapters" type="number"
               onChange={(event)=>onHandleInputChange('chapter',event?.target.value)}  />
            </div>

            {/* Video Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Include Video</label>
              <Switch
              onCheckedChange={()=>onHandleInputChange('includevideo',!formData?.includevideo)} />
            </div>

            {/* Difficulty */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select onValueChange={(value)=>onHandleInputChange('level',value)} >
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
              <Input placeholder="Category (Separated by Comma)"
               onChange={(event)=>onHandleInputChange('category',event?.target.value)}  />
            </div>

            {/* Button */}
            <div className="pt-2">
              <Button className="w-full flex items-center justify-center gap-2"
              onClick={onGenerate}>
                <Sparkle className="w-4 h-4" />
                Generate Course
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddNewCourse

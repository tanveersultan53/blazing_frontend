import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { createSocialIcon, updateSocialIcon, getSocialIcon } from '@/services/socialIconService';
import type { ISocialIcon } from '@/services/socialIconService';

export default function SocialIconForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<ISocialIcon>({
    name: '',
    image: null,
    mapping_key: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch social icon data if editing
  const { data: socialIconData, isLoading: isLoadingSocialIcon } = useQuery({
    queryKey: ['social-icon', id],
    queryFn: () => getSocialIcon(Number(id)),
    enabled: isEditMode,
  });

  // Handle social icon data when it changes
  useEffect(() => {
    if (socialIconData?.data) {
      const data = socialIconData.data;
      setFormData(data);

      if (data.image && typeof data.image === 'string') {
        setImagePreview(data.image);
      }
    }
  }, [socialIconData]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data: FormData) => {
      if (isEditMode) {
        return updateSocialIcon(Number(id), data);
      }
      return createSocialIcon(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-icons'] });
      toast.success(`Social icon ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate('/social-icons');
    },
    onError: (error: any) => {
      console.error('Save social icon error:', error);
      toast.error(error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} social icon`);
    },
  });

  const handleInputChange = (field: keyof ISocialIcon, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File | null) => {
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, image: null }));
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    if (!formData.mapping_key.trim()) {
      toast.error('Please enter a mapping key');
      return;
    }
    if (!isEditMode && !formData.image) {
      toast.error('Please upload an icon image');
      return;
    }

    const submitData = new FormData();

    // Add form fields
    submitData.append('name', formData.name);
    submitData.append('mapping_key', formData.mapping_key);

    if (formData.image instanceof File) {
      submitData.append('image', formData.image);
    }

    saveMutation.mutate(submitData);
  };

  const handleClear = () => {
    setFormData({
      name: '',
      image: null,
      mapping_key: '',
    });
    setImagePreview(null);
  };

  if (isEditMode && isLoadingSocialIcon) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <PageHeader
      title={isEditMode ? 'Edit Social Icon' : 'Create Social Icon'}
      description={isEditMode ? 'Update social icon information' : 'Create a new social media icon'}
      actions={[
        {
          label: 'Back to List',
          onClick: () => navigate('/social-icons'),
          variant: 'outline',
          icon: ArrowLeft,
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Icon Details</CardTitle>
            <CardDescription>
              Fill in the information for the social media icon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row: Name, Mapping Key, Icon Image */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Name */}
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Facebook, Twitter, Instagram"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              {/* Mapping Key */}
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="mapping_key">
                  Mapping Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mapping_key"
                  placeholder="e.g., facebook, twitter, instagram"
                  value={formData.mapping_key}
                  onChange={(e) => handleInputChange('mapping_key', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier used for API integration
                </p>
              </div>

              {/* Upload Image */}
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="image">
                  Icon Image <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                />
                {imagePreview && (
                  <div className="mt-2 p-4 border rounded-lg">
                    <img
                      src={imagePreview}
                      alt="Icon Preview"
                      className="h-16 w-16 object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={saveMutation.isPending}
              >
                Clear
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditMode ? 'Update' : 'Create'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageHeader>
  );
}

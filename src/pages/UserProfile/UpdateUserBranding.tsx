import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import api from "@/services/axiosInterceptor";
import type { AxiosResponse } from "axios";

interface IBranding {
  id?: number;
  companylogo?: File | string | null;
  photo?: File | string | null;
  logo?: File | string | null;
  qrcode?: File | string | null;
  personaltext?: string;
  disclosure?: string;
  hlogo?: number;
  wlogo?: number;
  hphoto?: number;
  wphoto?: number;
  custom?: boolean;
}

// API functions
const getBranding = (userId: string | number): Promise<AxiosResponse<IBranding>> =>
  api.get(`/accounts/users/register-branding/${userId}`);

const updateBranding = (userId: string | number, data: FormData): Promise<AxiosResponse<IBranding>> =>
  api.put(`/accounts/users/register-branding/${userId}`, data);

interface UpdateUserBrandingProps {
  userId: string | number | undefined;
  setIsEditMode: (isEdit: boolean) => void;
  refetch: () => void;
}

export default function UpdateUserBranding({ userId, setIsEditMode, refetch }: UpdateUserBrandingProps) {
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrcodePreview, setQrcodePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<IBranding>({
    personaltext: "",
    disclosure: "",
    hlogo: undefined,
    wlogo: undefined,
    hphoto: undefined,
    wphoto: undefined,
    custom: false,
  });

  // Fetch branding data
  const { data: brandingData, isLoading } = useQuery({
    queryKey: ["branding", userId],
    queryFn: () => getBranding(userId!),
    enabled: !!userId,
  });

  // Handle branding data when it changes
  useEffect(() => {
    if (brandingData?.data) {
      const data = brandingData.data;
      setFormData(data);

      // Set image previews if they exist
      if (data.companylogo && typeof data.companylogo === 'string') {
        setCompanyLogoPreview(data.companylogo);
      }
      if (data.photo && typeof data.photo === 'string') {
        setPhotoPreview(data.photo);
      }
      if (data.logo && typeof data.logo === 'string') {
        setLogoPreview(data.logo);
      }
      if (data.qrcode && typeof data.qrcode === 'string') {
        setQrcodePreview(data.qrcode);
      }
    }
  }, [brandingData]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateBranding(userId!, data),
    onSuccess: () => {
      toast.success("Branding updated successfully!");
      refetch();
      setIsEditMode(false);
    },
    onError: (error: any) => {
      console.error("Update branding error:", error);
      toast.error(error.response?.data?.error || "Failed to update branding");
    },
  });

  const handleImageUpload = (
    file: File | null,
    field: keyof IBranding,
    setPreview: (preview: string | null) => void
  ) => {
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({ ...prev, [field]: null }));
      setPreview(null);
    }
  };

  const handleInputChange = (field: keyof IBranding, value: string | number | boolean | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();

    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (value instanceof File) {
        submitData.append(key, value);
      } else if (typeof value === 'boolean') {
        submitData.append(key, value.toString());
      } else if (typeof value === 'number') {
        submitData.append(key, value.toString());
      } else if (typeof value === 'string' && value !== '') {
        submitData.append(key, value);
      }
    });

    updateMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Branding Assets */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold">Branding Assets</h3>

        {/* Company Logo */}
        <div className="space-y-2">
          <Label htmlFor="companylogo">Company Logo</Label>
          <Input
            id="companylogo"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            onChange={(e) =>
              handleImageUpload(
                e.target.files?.[0] || null,
                "companylogo",
                setCompanyLogoPreview
              )
            }
          />
          {companyLogoPreview && (
            <div className="mt-2 p-4 border rounded-lg">
              <img
                src={companyLogoPreview}
                alt="Company Logo Preview"
                className="h-24 object-contain"
              />
            </div>
          )}
        </div>

        {/* Professional Photo */}
        <div className="space-y-2">
          <Label htmlFor="photo">Professional Photo</Label>
          <Input
            id="photo"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            onChange={(e) =>
              handleImageUpload(e.target.files?.[0] || null, "photo", setPhotoPreview)
            }
          />
          {photoPreview && (
            <div className="mt-2 p-4 border rounded-lg">
              <img
                src={photoPreview}
                alt="Photo Preview"
                className="h-24 object-cover"
              />
            </div>
          )}
        </div>

        {/* Additional Logo */}
        <div className="space-y-2">
          <Label htmlFor="logo">Additional Logo</Label>
          <Input
            id="logo"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            onChange={(e) =>
              handleImageUpload(e.target.files?.[0] || null, "logo", setLogoPreview)
            }
          />
          {logoPreview && (
            <div className="mt-2 p-4 border rounded-lg">
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="h-24 object-contain"
              />
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="space-y-2">
          <Label htmlFor="qrcode">QR Code</Label>
          <Input
            id="qrcode"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif"
            onChange={(e) =>
              handleImageUpload(e.target.files?.[0] || null, "qrcode", setQrcodePreview)
            }
          />
          {qrcodePreview && (
            <div className="mt-2 p-4 border rounded-lg">
              <img
                src={qrcodePreview}
                alt="QR Code Preview"
                className="h-24 object-contain"
              />
            </div>
          )}
        </div>
      </div>

      {/* Branding Content */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold">Branding Content</h3>

        <div className="space-y-2">
          <Label htmlFor="personaltext">Personal Text / Bio</Label>
          <Textarea
            id="personaltext"
            placeholder="Enter your personal introduction or bio..."
            value={formData.personaltext || ""}
            onChange={(e) => handleInputChange("personaltext", e.target.value)}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="disclosure">Legal Disclosure</Label>
          <Textarea
            id="disclosure"
            placeholder="Enter legal disclosure text..."
            value={formData.disclosure || ""}
            onChange={(e) => handleInputChange("disclosure", e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Image Dimensions */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold">Image Dimensions (Optional)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hlogo">Logo Height (px)</Label>
            <Input
              id="hlogo"
              type="number"
              placeholder="Height"
              value={formData.hlogo || ""}
              onChange={(e) =>
                handleInputChange("hlogo", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wlogo">Logo Width (px)</Label>
            <Input
              id="wlogo"
              type="number"
              placeholder="Width"
              value={formData.wlogo || ""}
              onChange={(e) =>
                handleInputChange("wlogo", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hphoto">Photo Height (px)</Label>
            <Input
              id="hphoto"
              type="number"
              placeholder="Height"
              value={formData.hphoto || ""}
              onChange={(e) =>
                handleInputChange("hphoto", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wphoto">Photo Width (px)</Label>
            <Input
              id="wphoto"
              type="number"
              placeholder="Width"
              value={formData.wphoto || ""}
              onChange={(e) =>
                handleInputChange("wphoto", e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>
        </div>
      </div>

      {/* Custom Branding Toggle */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="custom"
          checked={formData.custom || false}
          onChange={(e) => handleInputChange("custom", e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="custom" className="cursor-pointer">
          Enable Custom Branding Options
        </Label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEditMode(false)}
          disabled={updateMutation.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { EditorRef } from "react-email-editor";
import type { CreateTemplateFormData, ITemplate } from "./interface";
import { createTemplate, getTemplateById } from "@/services/templateManagementService";
import { getUsers } from "@/services/userManagementService";

interface UseCreateTemplateProps {
  templateId?: string;
  templateData?: ITemplate;
  isAdmin?: boolean;
}

const useCreateTemplate = ({ templateId, templateData, isAdmin = false }: UseCreateTemplateProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [designJson, setDesignJson] = useState<object | null>(null);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<File | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const emailEditorRef = useRef<EditorRef>(null);
  const navigate = useNavigate();

  const form = useForm<CreateTemplateFormData>({
    defaultValues: {
      name: "",
      assigned_user_id: 0,
      type: "newsletter",
      is_active: true,
    },
    mode: "onChange",
  });

  // Fetch template data if in edit mode and only ID is provided
  const { data: fetchedTemplateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => getTemplateById(Number(templateId)),
    enabled: !!templateId && !templateData,
  });

  const template = templateData || fetchedTemplateData?.data;

  // Fetch users for dropdown - only if admin
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({}),
    enabled: isAdmin, // Only fetch if user is admin
  });

  const users = usersData?.data?.results || [];

  // Populate form with template data in edit mode
  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        assigned_user_id: template.customer || 0,
        type: template.type,
        is_active: template.is_active,
      });

      // Set HTML content and preview if available
      if (template.html_content) {
        setHtmlContent(template.html_content);
        setHtmlPreview(template.html_content);
      }

      // Set design JSON if available
      if (template.design_json) {
        setDesignJson(template.design_json);
      }
    }
  }, [template, form]);

  // Load design/HTML into editor when available
  useEffect(() => {
    if (template && emailEditorRef.current?.editor) {
      // Load design JSON if available
      if (template.design_json) {
        emailEditorRef.current.editor.loadDesign(template.design_json);
      } else if (template.html_content) {
        // Otherwise load HTML as a basic design
        const basicDesign: any = {
          counters: {},
          body: {
            rows: [
              {
                cells: [1],
                columns: [
                  {
                    contents: [
                      {
                        type: "html",
                        values: {
                          html: template.html_content,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        };
        emailEditorRef.current.editor.loadDesign(basicDesign);
      }
    }
  }, [template, emailEditorRef.current]);

  // Create template mutation
  const { mutate: createTemplateMutation } = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success("Template created successfully");
      setIsSubmitting(false);
      navigate("/template-management");
    },
    onError: (error: AxiosError) => {
      console.error("Error creating template:", error);
      setIsSubmitting(false);

      if (error.response?.data) {
        const errorData = error.response.data as Record<string, string[]>;
        Object.entries(errorData).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              toast.error(`${field}: ${message}`);
            });
          } else {
            toast.error(`${field}: ${messages}`);
          }
        });
      } else {
        toast.error("Failed to create template. Please try again.");
      }
    },
  });

  // Handle HTML file upload
  const handleHtmlFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "text/html") {
        toast.error("Please upload a valid HTML file");
        return;
      }

      setUploadedHtmlFile(file);

      // Read file content for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setHtmlPreview(content);
        setHtmlContent(content);
      };
      reader.readAsText(file);
    }
  };

  // Load HTML into email editor
  const loadHtmlIntoEditor = () => {
    if (htmlPreview && emailEditorRef.current?.editor) {
      // For react-email-editor, we need to convert HTML to design JSON
      // This is a basic implementation - you may need a more sophisticated converter
      const basicDesign: any = {
        counters: {},
        body: {
          rows: [
            {
              cells: [1],
              columns: [
                {
                  contents: [
                    {
                      type: "html",
                      values: {
                        html: htmlPreview,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      emailEditorRef.current.editor.loadDesign(basicDesign);
      toast.success("HTML loaded into editor");
    }
  };

  // Export HTML from email editor
  const exportHtmlFromEditor = () => {
    return new Promise<{ html: string; design: object }>((resolve, reject) => {
      const unlayer = emailEditorRef.current?.editor;

      if (unlayer) {
        unlayer.exportHtml((data: { design: object; html: string }) => {
          const { design, html } = data;
          setHtmlContent(html);
          setDesignJson(design);
          resolve({ html, design });
        });
      } else {
        reject(new Error("Editor not initialized"));
      }
    });
  };

  // Form submission
  const onSubmit = async (data: CreateTemplateFormData) => {
    // Validate template name
    if (!data.name.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    // Validate user selection
    if (!data.assigned_user_id || data.assigned_user_id === 0) {
      toast.error("Please select a user");
      return;
    }

    setIsSubmitting(true);

    try {
      // Export HTML from editor if not already exported
      let finalHtml = htmlContent;
      let finalDesign = designJson;

      if (emailEditorRef.current?.editor && !htmlContent) {
        const exported = await exportHtmlFromEditor();
        finalHtml = exported.html;
        finalDesign = exported.design;
      }

      // Validate that we have HTML content
      if (!finalHtml && !uploadedHtmlFile) {
        toast.error(
          "Please upload an HTML template or design one in the editor"
        );
        setIsSubmitting(false);
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("customer", data.assigned_user_id.toString());
      formData.append("type", data.type);
      formData.append("is_active", data.is_active.toString());

      // Add HTML content
      if (uploadedHtmlFile) {
        formData.append("html_file", uploadedHtmlFile);
      } else if (finalHtml) {
        formData.append("html_content", finalHtml);
      }

      // Add design JSON if available
      if (finalDesign) {
        formData.append("design_json", JSON.stringify(finalDesign));
      }

      console.log("=============================formDate========",formData)
      createTemplateMutation(formData);

    } catch (error) {
      console.error("Error preparing template:", error);
      toast.error("Failed to prepare template data");
      setIsSubmitting(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      // Cleanup any object URLs if needed
    };
  }, []);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    users,
    isLoadingUsers,
    isLoadingTemplate,
    emailEditorRef,
    handleHtmlFileUpload,
    uploadedHtmlFile,
    htmlPreview,
    loadHtmlIntoEditor,
    exportHtmlFromEditor,
    template,
  };
};

export default useCreateTemplate;

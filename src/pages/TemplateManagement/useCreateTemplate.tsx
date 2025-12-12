import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { EditorRef } from "react-email-editor";
import type { CreateTemplateFormData } from "./interface";
import { createTemplate } from "@/services/templateManagementService";
import { getUsers } from "@/services/userManagementService";

const useCreateTemplate = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [designJson, setDesignJson] = useState<object | null>(null);
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<File | null>(null);
  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
  const emailEditorRef = useRef<EditorRef>(null);
  const navigate = useNavigate();

  const form = useForm<CreateTemplateFormData>({
    defaultValues: {
      name: "",
      assigned_user_id: 0,
    },
    mode: "onChange",
  });

  // Fetch users for dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({}),
  });

  const users = usersData?.data?.results || [];

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

  // Handle attachment uploads
  const handleAttachmentUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      const allowedTypes = [".png", ".jpeg", ".jpg", ".pdf", ".doc", ".docx"];
      const validFiles: File[] = [];

      Array.from(files).forEach((file) => {
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
        if (allowedTypes.includes(fileExtension)) {
          validFiles.push(file);
        } else {
          toast.error(
            `File ${file.name} has invalid type. Only .png, .jpeg, .pdf, .doc, .docx are allowed.`
          );
        }
      });

      setAttachmentFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
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
      formData.append("assigned_user_id", data.assigned_user_id.toString());

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

      // Add attachments
      attachmentFiles.forEach((file) => {
        formData.append(`attachments`, file);
      });

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
    emailEditorRef,
    handleHtmlFileUpload,
    handleAttachmentUpload,
    removeAttachment,
    attachmentFiles,
    uploadedHtmlFile,
    htmlPreview,
    loadHtmlIntoEditor,
    exportHtmlFromEditor,
  };
};

export default useCreateTemplate;

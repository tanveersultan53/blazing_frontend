import React, { useState } from 'react';
import { loadTemplate } from '@/lib/templateLoader';
import { getTemplates } from '@/services/templateService';

const TemplateTest: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const templates = getTemplates();

  const handleLoadTemplate = async (templateId: string) => {
    setIsLoading(true);
    setError('');
    try {
      const content = await loadTemplate(templateId);
      setTemplateContent(content);
      setSelectedTemplate(templateId);
    } catch (err) {
      setError(`Failed to load template: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Template Loading Test</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Template:</label>
        <select 
          value={selectedTemplate} 
          onChange={(e) => handleLoadTemplate(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
          disabled={isLoading}
        >
          <option value="">Choose a template...</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="text-blue-600">Loading template...</div>
      )}

      {error && (
        <div className="text-red-600 bg-red-50 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {templateContent && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Template Content Preview:</h3>
          <div className="border rounded p-4 bg-gray-50 max-h-96 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">{templateContent.substring(0, 500)}...</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateTest;

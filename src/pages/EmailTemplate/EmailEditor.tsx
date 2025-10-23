//@ts-nocheck
import React, { useRef } from "react";
import { EmailEditor, type EmailEditorHandle } from "@usewaypoint/email-builder";
import "@usewaypoint/email-builder/dist/index.css";

const EmailBuilderApp: React.FC = () => {
  const editorRef = useRef<EmailEditorHandle>(null);

  const handleExport = async () => {
    if (editorRef.current) {
      const { html, design } = await editorRef.current.exportHtml();
      console.log("HTML:", html);
      console.log("Design JSON:", design);
    }
  };

  const handleImport = async () => {
    if (editorRef.current) {
      const savedDesign = localStorage.getItem("emailDesign");
      if (savedDesign) {
        await editorRef.current.importDesign(JSON.parse(savedDesign));
      }
    }
  };

  const handleSave = async () => {
    if (editorRef.current) {
      const { design } = await editorRef.current.exportHtml();
      localStorage.setItem("emailDesign", JSON.stringify(design));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="p-3 bg-white border-b shadow-sm flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Email Builder</h2>
        <div className="space-x-2">
          <button
            onClick={handleImport}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Load
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
          >
            Save
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Export HTML
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <EmailEditor ref={editorRef} />
      </main>
    </div>
  );
};

export default EmailBuilderApp;
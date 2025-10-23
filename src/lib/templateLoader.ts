// Template loader for .htm files in the components/templates folder
export const loadTemplate = async (templateId: string): Promise<string> => {
  try {
    // Try dynamic import first
    const templateModule = await import(`../components/templates/${templateId}.htm?raw`);
    return templateModule.default;
  } catch (error) {
    console.warn(`Dynamic import failed for ${templateId}, trying fetch approach:`, error);
    
    try {
      // Fallback to fetch approach
      const response = await fetch(`/src/components/templates/${templateId}.htm`);
      if (!response.ok) {
        throw new Error(`Template ${templateId} not found`);
      }
      return await response.text();
    } catch (fetchError) {
      console.error(`Both dynamic import and fetch failed for template ${templateId}:`, fetchError);
      throw new Error(`Template ${templateId} not found`);
    }
  }
};

// Alternative approach using fetch (if dynamic imports don't work)
export const loadTemplateWithFetch = async (templateId: string): Promise<string> => {
  try {
    const response = await fetch(`/src/components/templates/${templateId}.htm`);
    if (!response.ok) {
      throw new Error(`Template ${templateId} not found`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Failed to load template ${templateId}:`, error);
    throw new Error(`Template ${templateId} not found`);
  }
};

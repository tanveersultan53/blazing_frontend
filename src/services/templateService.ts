// Template service to handle loading HTML templates
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Template metadata based on your actual .htm files
export const TEMPLATES: Template[] = [
  { id: 'basic', name: 'Basic Template', description: 'Simple and clean email template', category: 'General' },
  { id: 'blank', name: 'Blank Template', description: 'Empty template to start from scratch', category: 'General' },
  { id: 'deskmug', name: 'Desk Mug Template', description: 'Professional office desk mug themed template', category: 'Business' },
  { id: 'deskpencil', name: 'Desk Pencil Template', description: 'Office supplies themed template', category: 'Business' },
  { id: 'deskplant', name: 'Desk Plant Template', description: 'Nature themed office template', category: 'Business' },
  { id: 'financialpage1', name: 'Financial Services 1', description: 'Financial services email template', category: 'Finance' },
  { id: 'financialpage2', name: 'Financial Services 2', description: 'Alternative financial services template', category: 'Finance' },
  { id: 'mortgageupdate1', name: 'Mortgage Update 1', description: 'Mortgage information and updates template', category: 'Real Estate' },
  { id: 'mortgageupdate2', name: 'Mortgage Update 2', description: 'Alternative mortgage update template', category: 'Real Estate' },
  { id: 'realestatepage1', name: 'Real Estate Listing 1', description: 'Real estate property listing template', category: 'Real Estate' },
  { id: 'realestatepage2', name: 'Real Estate Listing 2', description: 'Alternative real estate listing template', category: 'Real Estate' },
];

// Import the template loader
import { loadTemplate as loadTemplateContent } from '../lib/templateLoader';

// Function to load template HTML content
export const loadTemplate = loadTemplateContent;

// Function to get all available templates
export const getTemplates = (): Template[] => {
  return TEMPLATES;
};

// Function to get templates by category
export const getTemplatesByCategory = (category: string): Template[] => {
  return TEMPLATES.filter(template => template.category === category);
};

// Function to get template by ID
export const getTemplateById = (id: string): Template | undefined => {
  return TEMPLATES.find(template => template.id === id);
};

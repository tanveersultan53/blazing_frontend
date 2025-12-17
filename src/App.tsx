import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Users from './pages/Users';
import CreateUser from './pages/CreateUser';
import './index.css';
import Layout from './components/Layout.tsx';
import WithoutAuth from './components/PublicRoute';
import WithAuth from './components/ProtectedRoute';
import UserDetails from './pages/UserDetails';
import UserDashboard from './pages/UserDashboard';
import AddPerson from './pages/AddPerson/index.tsx';
import Contact from './pages/Contact';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import EmailTemplate from './pages/EmailTemplate';
import ReactQuillEditor from './pages/EmailTemplate/ReactQuill.tsx';
import EmailSentHistory from './pages/EmailSentHistory';
import TemplateManagement from './pages/TemplateManagement';
import CreateTemplate from './pages/TemplateManagement/CreateTemplate';
import ViewTemplate from './pages/TemplateManagement/ViewTemplate';
import MyEmailTemplates from './pages/MyEmailTemplates';
import CreateCustomerTemplate from './pages/MyEmailTemplates/CreateTemplate';
import BrowseTemplates from './pages/MyEmailTemplates/BrowseTemplates';
import SendEmail from './pages/SendEmail';
import NewsletterManagement from './pages/NewsletterManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithAuth><Layout /></WithAuth>} >
          <Route index element={<Users  />} />
          <Route path="users/create" element={<CreateUser />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="user-dashboard" element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="add-person" element={<AddPerson />} />
          <Route path="contacts/:id" element={<Contact />} />
          <Route path="template-management" element={<TemplateManagement />} />
          <Route path="template-management/create" element={<CreateTemplate />} />
          <Route path="template-management/edit/:id" element={<CreateTemplate />} />
          <Route path="template-management/view/:id" element={<ViewTemplate />} />
          <Route path="my-email-templates" element={<MyEmailTemplates />} />
          <Route path="my-email-templates/create" element={<CreateCustomerTemplate />} />
          <Route path="my-email-templates/edit/:id" element={<CreateCustomerTemplate />} />
          <Route path="my-email-templates/duplicate/:id" element={<CreateCustomerTemplate />} />
          <Route path="my-email-templates/browse" element={<BrowseTemplates />} />
          <Route path="send-email/:templateId" element={<SendEmail />} />
          <Route path="email-template-editor" element={<EmailTemplate />} />
          <Route path="react-quill-editor" element={<ReactQuillEditor />} />
          <Route path="email-sent-history" element={<EmailSentHistory />} />
          <Route path="newsletters" element={<NewsletterManagement />} />
        </Route>
        <Route path="/login" element={<WithoutAuth><Login /></WithoutAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

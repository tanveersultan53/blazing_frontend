import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  User,
  Building,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'New York, NY',
    phone: '+1 (555) 123-4567',
    joinedDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'User',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Los Angeles, CA',
    phone: '+1 (555) 234-5678',
    joinedDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Moderator',
    status: 'Inactive',
    avatar: '/placeholder-avatar.jpg',
    location: 'Chicago, IL',
    phone: '+1 (555) 345-6789',
    joinedDate: '2023-03-10',
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'User',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Miami, FL',
    phone: '+1 (555) 456-7890',
    joinedDate: '2023-04-05',
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    role: 'User',
    status: 'Pending',
    avatar: '/placeholder-avatar.jpg',
    location: 'Seattle, WA',
    phone: '+1 (555) 567-8901',
    joinedDate: '2023-05-12',
  },
  {
    id: 6,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    role: 'User',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Boston, MA',
    phone: '+1 (555) 678-9012',
    joinedDate: '2023-06-18',
  },
  {
    id: 7,
    name: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    role: 'Moderator',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Denver, CO',
    phone: '+1 (555) 789-0123',
    joinedDate: '2023-07-22',
  },
  {
    id: 8,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@example.com',
    role: 'User',
    status: 'Inactive',
    avatar: '/placeholder-avatar.jpg',
    location: 'Phoenix, AZ',
    phone: '+1 (555) 890-1234',
    joinedDate: '2023-08-30',
  },
  {
    id: 9,
    name: 'Robert Taylor',
    email: 'robert.taylor@example.com',
    role: 'Admin',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Austin, TX',
    phone: '+1 (555) 901-2345',
    joinedDate: '2023-09-14',
  },
  {
    id: 10,
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@example.com',
    role: 'User',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Portland, OR',
    phone: '+1 (555) 012-3456',
    joinedDate: '2023-10-08',
  },
  {
    id: 11,
    name: 'Christopher Lee',
    email: 'christopher.lee@example.com',
    role: 'User',
    status: 'Pending',
    avatar: '/placeholder-avatar.jpg',
    location: 'Nashville, TN',
    phone: '+1 (555) 123-4567',
    joinedDate: '2023-11-25',
  },
  {
    id: 12,
    name: 'Amanda Garcia',
    email: 'amanda.garcia@example.com',
    role: 'Moderator',
    status: 'Active',
    avatar: '/placeholder-avatar.jpg',
    location: 'Las Vegas, NV',
    phone: '+1 (555) 234-5678',
    joinedDate: '2023-12-03',
  },
];

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    rep_name: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company: '',
    title: '',
    work_phone: '',
    work_ext: '',
    cellphone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    license: '',
    branchid: '',
    industry: '',
    admin: false,
  });

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating user:', createUserData);
    // Here you would typically make an API call to create the user
    setShowCreateModal(false);
    // Reset form
    setCreateUserData({
      rep_name: '',
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      company: '',
      title: '',
      work_phone: '',
      work_ext: '',
      cellphone: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      website: '',
      license: '',
      branchid: '',
      industry: '',
      admin: false,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCreateUserData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Moderator':
        return 'bg-blue-100 text-blue-800';
      case 'User':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
          </div>
          <Button 
            className="bg-black hover:bg-gray-800"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
                <option value="User">User</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Joined</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{user.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(user.joinedDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">No users found</h3>
                  <p>Try adjusting your search or filter criteria</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} results
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="rep_name">Representative Name</Label>
                  <Input
                    id="rep_name"
                    name="rep_name"
                    value={createUserData.rep_name}
                    onChange={handleInputChange}
                    placeholder="Enter representative name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={createUserData.first_name}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={createUserData.last_name}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={createUserData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={createUserData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={createUserData.title}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                  />
                </div>
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    name="company"
                    value={createUserData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Input
                    id="license"
                    name="license"
                    value={createUserData.license}
                    onChange={handleInputChange}
                    placeholder="Enter license number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branchid">Branch ID</Label>
                  <Input
                    id="branchid"
                    name="branchid"
                    value={createUserData.branchid}
                    onChange={handleInputChange}
                    placeholder="Enter branch ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={createUserData.industry}
                    onChange={handleInputChange}
                    placeholder="Enter industry"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="work_phone">Work Phone</Label>
                  <Input
                    id="work_phone"
                    name="work_phone"
                    value={createUserData.work_phone}
                    onChange={handleInputChange}
                    placeholder="Enter work phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work_ext">Work Extension</Label>
                  <Input
                    id="work_ext"
                    name="work_ext"
                    value={createUserData.work_ext}
                    onChange={handleInputChange}
                    placeholder="Enter extension"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone">Cell Phone</Label>
                  <Input
                    id="cellphone"
                    name="cellphone"
                    value={createUserData.cellphone}
                    onChange={handleInputChange}
                    placeholder="Enter cell phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    value={createUserData.website}
                    onChange={handleInputChange}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={createUserData.address}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address2">Address 2</Label>
                  <Input
                    id="address2"
                    name="address2"
                    value={createUserData.address2}
                    onChange={handleInputChange}
                    placeholder="Enter apartment, suite, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={createUserData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={createUserData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    value={createUserData.zip}
                    onChange={handleInputChange}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              {/* Admin Access */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin"
                  name="admin"
                  checked={createUserData.admin}
                  onCheckedChange={(checked) => 
                    setCreateUserData(prev => ({ ...prev, admin: checked as boolean }))
                  }
                />
                <Label htmlFor="admin" className="text-sm">
                  Grant admin access to this user
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-gray-800">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

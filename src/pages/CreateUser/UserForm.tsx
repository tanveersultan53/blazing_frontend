import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useCreateUser from './useCreateUser';
import { useNavigate } from 'react-router-dom';
import { urlValidation } from '@/lib/utils';
import { formatCellPhone, autoFormatPhoneNumber } from '@/lib/phoneFormatter';

const UserForm = () => {
  const { form, onSubmit, isSubmitting } = useCreateUser();
  const { register, formState: { errors }, watch, setValue } = form;
  const navigate = useNavigate();
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Personal Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium">
                First Name *
              </label>
              <Input
                id="first_name"
                placeholder="Enter first name"
                {...register('first_name', {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'First name must be at least 2 characters' }
                })}
                className={errors.first_name ? 'border-red-500' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-red-500">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="mid" className="text-sm font-medium">
                Middle Name
              </label>
              <Input
                id="mid"
                placeholder="Enter Middle Name"
                {...register('mid')}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium">
                Last Name *
              </label>
              <Input
                id="last_name"
                placeholder="Enter last name"
                {...register('last_name', {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                })}
                className={errors.last_name ? 'border-red-500' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-red-500">{errors.last_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password *
              </label>
              <PasswordInput
                id="password"
                placeholder="Enter password (min 8 characters)"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
                error={!!errors.password}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Enter title"
                {...register('title')}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              checked={form.watch('is_active')}
              onCheckedChange={(checked) => form.setValue('is_active', checked as boolean)}
            />
            <label htmlFor="is_active" className="text-sm font-medium">
              Make this user active by default
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Company Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company Name *
              </label>
              <Input
                id="company"
                placeholder="Enter company name"
                {...register('company', {
                  required: 'Company name is required',
                  minLength: { value: 2, message: 'Company name must be at least 2 characters' }
                })}
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && (
                <p className="text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="company_id" className="text-sm font-medium">
                Company ID *
              </label>
              <Input
                id="company_id"
                type="text"
                placeholder="Enter company ID (numbers only)"
                {...register('company_id', {
                  required: 'Company ID is required',
                  pattern: {
                    value: /^\d+$/,
                    message: 'A valid integer is required.'
                  }
                })}
                className={errors.company_id ? 'border-red-500' : ''}
              />
              {errors.company_id && (
                <p className="text-sm text-red-500">{errors.company_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="rep_name" className="text-sm font-medium">
                Representative Name
              </label>
              <Input
                id="rep_name"
                placeholder="Enter representative name"
                {...register('rep_name')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website
              </label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                {...register('website', urlValidation)}
                className={errors.website ? 'border-red-500' : ''}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="branch_id" className="text-sm font-medium">
                Branch Lisence
              </label>
              <Input
                id="branch_id"
                placeholder="Enter branch lisence"
                {...register('branch_id')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="personal_license" className="text-sm font-medium">
                Personal Lisence
              </label>
              <Input
                id="personal_license"
                placeholder="Enter personal lisence"
                {...register('personal_license')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="industry_type" className="text-sm font-medium">
                Industry Type
              </label>
              <Select onValueChange={(value) => setValue('industry_type', value)} value={watch('industry_type')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select industry type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mortgage">Mortgage</SelectItem>
                  <SelectItem value="Real Estate">Real Estate</SelectItem>
                  <SelectItem value="Title Insurance">Title Insurance</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
              {errors.industry_type && (
                <p className="text-sm text-red-500">{errors.industry_type.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium">
                Address *
              </label>
              <Input
                id="address"
                placeholder="Enter street address"
                {...register('address', {
                  required: 'Address is required',
                  minLength: { value: 5, message: 'Address must be at least 5 characters' }
                })}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="address2" className="text-sm font-medium">
                Address Line 2
              </label>
              <Input
                id="address2"
                placeholder="Enter apartment, suite, etc. (optional)"
                {...register('address2')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                City *
              </label>
              <Input
                id="city"
                placeholder="Enter city"
                {...register('city', {
                  required: 'City is required',
                  minLength: { value: 2, message: 'City must be at least 2 characters' }
                })}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">
                State *
              </label>
              <Input
                id="state"
                placeholder="Enter state"
                {...register('state', {
                  required: 'State is required',
                  minLength: { value: 2, message: 'State must be at least 2 characters' }
                })}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="zip_code" className="text-sm font-medium">
                ZIP Code *
              </label>
              <Input
                id="zip_code"
                placeholder="12345 or 12345-6789"
                {...register('zip_code', {
                  required: 'ZIP code is required',
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                  }
                })}
                className={errors.zip_code ? 'border-red-500' : ''}
              />
              {errors.zip_code && (
                <p className="text-sm text-red-500">{errors.zip_code.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="work_phone" className="text-sm font-medium">
                Work Phone
              </label>
              <Input
                id="work_phone"
                type="tel"
                placeholder="(858) 369-5555"
                {...register('work_phone', {
                  pattern: {
                    value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                    message: 'Phone number must be in format: (XXX) XXX-XXXX'
                  },
                  onChange: (e) => {
                    const formatted = autoFormatPhoneNumber(e.target.value);
                    setValue('work_phone', formatted, { shouldValidate: true });
                  }
                })}
                className={errors.work_phone ? 'border-red-500' : ''}
              />
              {errors.work_phone && (
                <p className="text-sm text-red-500">{errors.work_phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="work_ext" className="text-sm font-medium">
                Work Extension
              </label>
              <Input
                id="work_ext"
                placeholder="Enter extension"
                {...register('work_ext')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cellphone" className="text-sm font-medium">
                Cell Phone
              </label>
              <Input
                id="cellphone"
                type="tel"
                placeholder="(858) 369-5555"
                {...register('cellphone', {
                  pattern: {
                    value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                    message: 'Phone number must be in format: (XXX) XXX-XXXX'
                  },
                  onChange: (e) => {
                    const formatted = autoFormatPhoneNumber(e.target.value);
                    setValue('cellphone', formatted, { shouldValidate: true });
                  }
                })}
                className={errors.cellphone ? 'border-red-500' : ''}
              />
              {errors.cellphone && (
                <p className="text-sm text-red-500">{errors.cellphone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating User...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;

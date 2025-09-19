import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useAddPerson from './useAddPerson';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

const AddPersonForm = ({ type }: { type: string | null }) => {
    const { form, onSubmit, isSubmitting } = useAddPerson();
    const { register, formState: { errors }, setValue, watch } = form;
    const navigate = useNavigate();

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Primary Contact Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Primary Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* First Name */}
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

                        {/* Last Name */}
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

                        {type === 'referal_partner' && <>
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
                        </>}


                        {/* Email */}
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

                        {/* Address */}
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

                        {/* City */}
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

                        {/* State */}
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

                        {/* ZIP */}
                        <div className="space-y-2">
                            <label htmlFor="zip" className="text-sm font-medium">
                                ZIP Code *
                            </label>
                            <Input
                                id="zip"
                                placeholder="12345 or 12345-6789"
                                {...register('zip', {
                                    required: 'ZIP code is required',
                                    pattern: {
                                        value: /^\d{5}(-\d{4})?$/,
                                        message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
                                    }
                                })}
                                className={errors.zip ? 'border-red-500' : ''}
                            />
                            {errors.zip && (
                                <p className="text-sm text-red-500">{errors.zip.message}</p>
                            )}
                        </div>

                        {/* Cell */}
                        <div className="space-y-2">
                            <label htmlFor="cell" className="text-sm font-medium">
                                Cell Phone *
                            </label>
                            <Input
                                id="cell"
                                type="tel"
                                placeholder="e.g., +1234567890"
                                {...register('cellphone', {
                                    pattern: {
                                        value: /^\+[1-9]\d{1,14}$/,
                                        message: 'Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
                                    }
                                })}
                                className={errors.cell ? 'border-red-500' : ''}
                            />
                            {errors.cell && (
                                <p className="text-sm text-red-500">{errors.cell.message}</p>
                            )}
                        </div>

                        {/* Work Phone */}
                        <div className="space-y-2">
                            <label htmlFor="work_phone" className="text-sm font-medium">
                                Work Phone
                            </label>
                            <Input
                                id="work_phone"
                                type="tel"
                                placeholder="e.g., +1234567890"
                                {...register('work_phone', {
                                    pattern: {
                                        value: /^\+[1-9]\d{1,14}$/,
                                        message: 'Phone number must be entered in the format: +999999999. Up to 15 digits allowed.'
                                    }
                                })}
                                className={errors.work_phone ? 'border-red-500' : ''}
                            />
                            {errors.work_phone && (
                                <p className="text-sm text-red-500">{errors.work_phone.message}</p>
                            )}
                        </div>

                        {/* Birthday */}
                        <div className="space-y-2">
                            <label htmlFor="birthday" className="text-sm font-medium">
                                Birthday
                            </label>
                            <div className="w-full">
                                <DatePicker
                                    value={watch('birthday') ? new Date(watch('birthday')!) : undefined}
                                    onChange={(date: Date | undefined) => setValue('birthday', date ? format(date, 'yyyy-MM-dd') : null)}
                                />
                            </div>

                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                            <label htmlFor="age" className="text-sm font-medium">
                                Age
                            </label>
                            <Input
                                id="age"
                                type="number"
                                placeholder="Enter age"
                                min="0"
                                max="150"
                                {...register('age', {
                                    min: { value: 0, message: 'Age must be a positive number' },
                                    max: { value: 150, message: 'Age must be less than 150' }
                                })}
                                className={errors.age ? 'border-red-500' : ''}
                            />
                            {errors.age && (
                                <p className="text-sm text-red-500">{errors.age.message}</p>
                            )}
                        </div>

                        {/* Group */}
                        <div className="space-y-2">
                            <label htmlFor="group" className="text-sm font-medium">
                                Group
                            </label>
                            <Select onValueChange={(value) => setValue('group', value)} value={watch('group')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="family">Family</SelectItem>
                                    <SelectItem value="friends">Friends</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label htmlFor="status" className="text-sm font-medium">
                                Status
                            </label>
                            <Select onValueChange={(value) => setValue('status', value)} value={watch('status')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectContent>
                                        <SelectItem value="send">Send</SelectItem>
                                        <SelectItem value="dont_send">Don't Send</SelectItem>
                                    </SelectContent>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Optout */}
                        <div className="space-y-2">
                            <label htmlFor="optout" className="text-sm font-medium">
                                Optout
                            </label>
                            <Select onValueChange={(value) => setValue('optout', value)} value={watch('optout')}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Optout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectContent>
                                        <SelectItem value="send">Send</SelectItem>
                                        <SelectItem value="dont_send">Don't Send</SelectItem>
                                    </SelectContent>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-2">
                            <label htmlFor="newsletter_version" className="text-sm font-medium">
                                Newsletter Version
                            </label>
                            <Select
                                onValueChange={(value) => setValue('newsletter_version', value as 'long_version' | 'short_version' | 'none')}
                                value={watch('newsletter_version')}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Newsletter version" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="long_version">Long Version</SelectItem>
                                    <SelectItem value="short_version">Short Version</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Secondary Contact Section */}
            {type === 'contact' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Secondary Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Spouse First Name */}
                            <div className="space-y-2">
                                <label htmlFor="spouse_first" className="text-sm font-medium">
                                    First Name
                                </label>
                                <Input
                                    id="spouse_first"
                                    placeholder="Enter spouse first name"
                                    {...register('spouse_first')}
                                />
                            </div>

                            {/* Spouse Last Name */}
                            <div className="space-y-2">
                                <label htmlFor="spouse_last" className="text-sm font-medium">
                                    Last Name
                                </label>
                                <Input
                                    id="spouse_last"
                                    placeholder="Enter spouse last name"
                                    {...register('spouse_last')}
                                />
                            </div>

                            {/* Spouse Email */}
                            <div className="space-y-2">
                                <label htmlFor="spouse_email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="spouse_email"
                                    type="email"
                                    placeholder="Enter spouse email"
                                    {...register('spouse_email', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className={errors.spouse_email ? 'border-red-500' : ''}
                                />
                                {errors.spouse_email && (
                                    <p className="text-sm text-red-500">{errors.spouse_email.message}</p>
                                )}
                            </div>

                            {/* Spouse Birthday */}
                            <div className="space-y-2">
                                <label htmlFor="sbirthday" className="text-sm font-medium">
                                    Birthday
                                </label>
                                <div className="w-full">
                                    <DatePicker
                                        value={watch('sbirthday') ? new Date(watch('sbirthday')!) : undefined}
                                        onChange={(date: Date | undefined) => setValue('sbirthday', date ? format(date, 'yyyy-MM-dd') : null)}
                                    />
                                </div>
                            </div>

                            {/* Spouse Age */}
                            <div className="space-y-2">
                                <label htmlFor="sage" className="text-sm font-medium">
                                    Age
                                </label>
                                <Input
                                    id="sage"
                                    type="number"
                                    placeholder="Enter spouse age"
                                    min="0"
                                    max="150"
                                    {...register('sage', {
                                        min: { value: 0, message: 'Age must be a positive number' },
                                        max: { value: 150, message: 'Age must be less than 150' }
                                    })}
                                    className={errors.sage ? 'border-red-500' : ''}
                                />
                                {errors.sage && (
                                    <p className="text-sm text-red-500">{errors.sage.message}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Notes Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <label htmlFor="notes" className="text-sm font-medium">
                            Notes
                        </label>
                        <Textarea
                            id="notes"
                            placeholder="Enter any additional notes..."
                            rows={15}
                            {...register('notes')}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end items-center mb-6">
                <div className="flex space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/users')}
                        disabled={isSubmitting}
                    >
                        Close
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default AddPersonForm;

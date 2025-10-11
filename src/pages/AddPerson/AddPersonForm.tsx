import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ChangeEvent } from 'react';
import useAddPerson from './useAddPerson';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { autoFormatPhoneNumber } from '@/lib/phoneFormatter';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';

const AddPersonForm = ({ type }: { type: string | null }) => {
    const { form, onSubmit, isSubmitting } = useAddPerson();
    const { register, formState: { errors }, setValue, watch } = form;
    const navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.user);
    
    // Show loan fields only if current user's industry type is Mortgage
    const showLoanFields = currentUser?.industry_type === 'Mortgage';

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

                        {type === 'partner' && <>
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium">
                                    Title
                                </label>
                                <Input
                                    id="title"
                                    placeholder="Enter title"
                                    {...register('title')}
                                    className={errors.title ? 'border-red-500' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-500">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="company" className="text-sm font-medium">
                                    Company Name
                                </label>
                                <Input
                                    id="company"
                                    placeholder="Enter company name"
                                    {...register('company')}
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
                                Address
                            </label>
                            <Input
                                id="address"
                                placeholder="Enter street address"
                                {...register('address')}
                                className={errors.address ? 'border-red-500' : ''}
                            />
                            {errors.address && (
                                <p className="text-sm text-red-500">{errors.address.message}</p>
                            )}
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <label htmlFor="city" className="text-sm font-medium">
                                City
                            </label>
                            <Input
                                id="city"
                                placeholder="Enter city"
                                {...register('city')}
                                className={errors.city ? 'border-red-500' : ''}
                            />
                            {errors.city && (
                                <p className="text-sm text-red-500">{errors.city.message}</p>
                            )}
                        </div>

                        {/* State */}
                        <div className="space-y-2">
                            <label htmlFor="state" className="text-sm font-medium">
                                State
                            </label>
                            <Input
                                id="state"
                                placeholder="Enter state"
                                {...register('state')}
                                className={errors.state ? 'border-red-500' : ''}
                            />
                            {errors.state && (
                                <p className="text-sm text-red-500">{errors.state.message}</p>
                            )}
                        </div>

                        {/* ZIP */}
                        <div className="space-y-2">
                            <label htmlFor="zip_code" className="text-sm font-medium">
                                ZIP Code
                            </label>
                            <Input
                                id="zip_code"
                                placeholder="12345 or 12345-6789"
                                {...register('zip_code')}
                                className={errors.zip_code ? 'border-red-500' : ''}
                            />
                            {errors.zip_code && (
                                <p className="text-sm text-red-500">{errors.zip_code.message}</p>
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
                                placeholder="(858) 369-5555"
                                {...register('cell', {
                                    required: 'Cell phone is required',
                                    pattern: {
                                        value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                                        message: 'Phone number must be in format: (XXX) XXX-XXXX'
                                    },
                                    onChange: (e: ChangeEvent<HTMLInputElement>) => {
                                        const formatted = autoFormatPhoneNumber(e.target.value);
                                        setValue('cell', formatted, { shouldValidate: true });
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
                                placeholder="(858) 369-5555"
                                {...register('work_phone', {
                                    pattern: {
                                        value: /^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\+1\d{10}$/,
                                        message: 'Phone number must be in format: (XXX) XXX-XXXX'
                                    },
                                    onChange: (e: ChangeEvent<HTMLInputElement>) => {
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
                            {errors.birthday && (
                                <p className="text-sm text-red-500">{errors.birthday.message}</p>
                            )}
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
                            <Input
                                id="group"
                                placeholder="Enter group name"
                                {...register('group')}
                                className={errors.group ? 'border-red-500' : ''}
                            />
                            {errors.group && (
                                <p className="text-sm text-red-500">{errors.group.message}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label htmlFor="send_status" className="text-sm font-medium">
                                Status
                            </label>
                            <Select onValueChange={(value) => setValue('send_status', value)} value={watch('send_status')}>
                                <SelectTrigger className={`w-full ${errors.send_status ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="send">Send</SelectItem>
                                    <SelectItem value="dont_send">Don't Send</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.send_status && (
                                <p className="text-sm text-red-500">{errors.send_status.message}</p>
                            )}
                        </div>

                        {/* Optout */}
                        <div className="space-y-2">
                            <label htmlFor="optout" className="text-sm font-medium">
                                Optout
                            </label>
                            <Select onValueChange={(value) => setValue('optout', value)} value={watch('optout')}>
                                <SelectTrigger className={`w-full ${errors.optout ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select Optout" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="send">Send</SelectItem>
                                    <SelectItem value="dont_send">Don't Send</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.optout && (
                                <p className="text-sm text-red-500">{errors.optout.message}</p>
                            )}
                        </div>

                        {/* Newsletter */}
                        <div className="space-y-2">
                            <label htmlFor="newsletter_version" className="text-sm font-medium">
                                Newsletter Version
                            </label>
                            <Select
                                onValueChange={(value) => setValue('newsletter_version', value as 'long' | 'short' | 'none')}
                                value={watch('newsletter_version')}
                            >
                                <SelectTrigger className={`w-full ${errors.newsletter_version ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="Select Newsletter version" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="long">Long Version</SelectItem>
                                    <SelectItem value="short">Short Version</SelectItem>
                                    <SelectItem value="none">None</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.newsletter_version && (
                                <p className="text-sm text-red-500">{errors.newsletter_version.message}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loan Details Section - Only show if user industry type is Mortgage */}
            {showLoanFields && (
                <Card>
                    <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Loan Status */}
                            <div className="space-y-2">
                                <label htmlFor="loan_status" className="text-sm font-medium">
                                    Loan Status
                                </label>
                                <Select onValueChange={(value) => setValue('loan_status', value)} value={watch('loan_status')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select loan status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                        <SelectItem value="Approved">Approved</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                        <SelectItem value="Denied">Denied</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Interest Rate */}
                            <div className="space-y-2">
                                <label htmlFor="interest_rate" className="text-sm font-medium">
                                    Interest Rate
                                </label>
                                <Input
                                    id="interest_rate"
                                    type="text"
                                    placeholder="e.g., 6.5%"
                                    {...register('interest_rate')}
                                />
                            </div>

                            {/* Sales Price */}
                            <div className="space-y-2">
                                <label htmlFor="sales_price" className="text-sm font-medium">
                                    Sales Price
                                </label>
                                <Input
                                    id="sales_price"
                                    type="text"
                                    placeholder="e.g., $500,000"
                                    {...register('sales_price')}
                                />
                            </div>

                            {/* Loan Amount */}
                            <div className="space-y-2">
                                <label htmlFor="loan_amount" className="text-sm font-medium">
                                    Loan Amount
                                </label>
                                <Input
                                    id="loan_amount"
                                    type="text"
                                    placeholder="e.g., $400,000"
                                    {...register('loan_amount')}
                                />
                            </div>

                            {/* % Down */}
                            <div className="space-y-2">
                                <label htmlFor="percent_down" className="text-sm font-medium">
                                    % Down
                                </label>
                                <Input
                                    id="percent_down"
                                    type="text"
                                    placeholder="e.g., 20%"
                                    {...register('percent_down')}
                                />
                            </div>

                            {/* LTV */}
                            <div className="space-y-2">
                                <label htmlFor="ltv" className="text-sm font-medium">
                                    LTV
                                </label>
                                <Input
                                    id="ltv"
                                    type="text"
                                    placeholder="e.g., 80%"
                                    {...register('ltv')}
                                />
                            </div>

                            {/* Close Date */}
                            <div className="space-y-2">
                                <label htmlFor="close_date" className="text-sm font-medium">
                                    Close Date
                                </label>
                                <Input
                                    id="close_date"
                                    type="date"
                                    {...register('close_date', {
                                        pattern: {
                                            value: /^\d{4}-\d{2}-\d{2}$/,
                                            message: 'Date must be in YYYY-MM-DD format'
                                        }
                                    })}
                                    className={errors.close_date ? 'border-red-500' : ''}
                                />
                                {errors.close_date && (
                                    <p className="text-sm text-red-500">{errors.close_date.message}</p>
                                )}
                            </div>

                            {/* Loan Program */}
                            <div className="space-y-2">
                                <label htmlFor="loan_program" className="text-sm font-medium">
                                    Loan Program
                                </label>
                                <Input
                                    id="loan_program"
                                    type="text"
                                    placeholder="e.g., Conventional, FHA, VA"
                                    {...register('loan_program')}
                                />
                            </div>

                            {/* Loan Type */}
                            <div className="space-y-2">
                                <label htmlFor="loan_type" className="text-sm font-medium">
                                    Loan Type
                                </label>
                                <Select onValueChange={(value) => setValue('loan_type', value)} value={watch('loan_type')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select loan type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Purchase">Purchase</SelectItem>
                                        <SelectItem value="Refinance">Refinance</SelectItem>
                                        <SelectItem value="HELOC">HELOC</SelectItem>
                                        <SelectItem value="Reverse">Reverse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Property Type */}
                            <div className="space-y-2">
                                <label htmlFor="property_type" className="text-sm font-medium">
                                    Property Type
                                </label>
                                <Select onValueChange={(value) => setValue('property_type', value)} value={watch('property_type')}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select property type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Primary">Primary</SelectItem>
                                        <SelectItem value="Secondary">Secondary</SelectItem>
                                        <SelectItem value="Investment">Investment</SelectItem>
                                        <SelectItem value="Construction">Construction</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Secondary Contact Section */}
            {type === 'contact' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Secondary Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Secondary First Name */}
                            <div className="space-y-2">
                                <label htmlFor="secondary_first_name" className="text-sm font-medium">
                                    First Name
                                </label>
                                <Input
                                    id="secondary_first_name"
                                    placeholder="Enter secondary first name"
                                    {...register('secondary_first_name')}
                                    className={errors.secondary_first_name ? 'border-red-500' : ''}
                                />
                                {errors.secondary_first_name && (
                                    <p className="text-sm text-red-500">{errors.secondary_first_name.message}</p>
                                )}
                            </div>

                            {/* Secondary Last Name */}
                            <div className="space-y-2">
                                <label htmlFor="secondary_last_name" className="text-sm font-medium">
                                    Last Name
                                </label>
                                <Input
                                    id="secondary_last_name"
                                    placeholder="Enter secondary last name"
                                    {...register('secondary_last_name')}
                                    className={errors.secondary_last_name ? 'border-red-500' : ''}
                                />
                                {errors.secondary_last_name && (
                                    <p className="text-sm text-red-500">{errors.secondary_last_name.message}</p>
                                )}
                            </div>

                            {/* Secondary Email */}
                            <div className="space-y-2">
                                <label htmlFor="secondary_email" className="text-sm font-medium">
                                    Email
                                </label>
                                <Input
                                    id="secondary_email"
                                    type="email"
                                    placeholder="Enter secondary email"
                                    {...register('secondary_email', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className={errors.secondary_email ? 'border-red-500' : ''}
                                />
                                {errors.secondary_email && (
                                    <p className="text-sm text-red-500">{errors.secondary_email.message}</p>
                                )}
                            </div>

                            {/* Secondary Birthday */}
                            <div className="space-y-2">
                                <label htmlFor="secondary_birthday" className="text-sm font-medium">
                                    Birthday
                                </label>
                                <div className="w-full">
                                    <DatePicker
                                        value={watch('secondary_birthday') ? new Date(watch('secondary_birthday')!) : undefined}
                                        onChange={(date: Date | undefined) => setValue('secondary_birthday', date ? format(date, 'yyyy-MM-dd') : null)}
                                    />
                                </div>
                                {errors.secondary_birthday && (
                                    <p className="text-sm text-red-500">{errors.secondary_birthday.message}</p>
                                )}
                            </div>

                            {/* Secondary Age */}
                            <div className="space-y-2">
                                <label htmlFor="secondary_age" className="text-sm font-medium">
                                    Age
                                </label>
                                <Input
                                    id="secondary_age"
                                    type="number"
                                    placeholder="Enter secondary age"
                                    min="0"
                                    max="150"
                                    {...register('secondary_age', {
                                        min: { value: 0, message: 'Age must be a positive number' },
                                        max: { value: 150, message: 'Age must be less than 150' }
                                    })}
                                    className={errors.secondary_age ? 'border-red-500' : ''}
                                />
                                {errors.secondary_age && (
                                    <p className="text-sm text-red-500">{errors.secondary_age.message}</p>
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
                            rows={5}
                            {...register('notes')}
                            className={`min-h-[200px] field-sizing-auto ${errors.notes ? 'border-red-500' : ''}`}
                        />
                        {errors.notes && (
                            <p className="text-sm text-red-500">{errors.notes.message}</p>
                        )}
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

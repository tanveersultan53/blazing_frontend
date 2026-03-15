import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import type { ImportTemplate } from './types';

interface ImportOptionsModalProps {
    open: boolean;
    onClose: () => void;
    options: ImportTemplate;
    onSave: (options: Partial<ImportTemplate>) => void;
}

const ImportOptionsModal = ({ open, onClose, options, onSave }: ImportOptionsModalProps) => {
    const [formOptions, setFormOptions] = useState({
        add_optout: options.add_optout,
        email_only: options.email_only,
        force_add: options.force_add,
        dont_contact: options.dont_contact,
        fixname1: options.fixname1,
        fixname2: options.fixname2,
        fixname3: options.fixname3,
        fixaddress1: options.fixaddress1,
        fixaddress2: options.fixaddress2,
        fixaddress3: options.fixaddress3,
    });

    const handleCheckboxChange = (field: keyof typeof formOptions, checked: boolean) => {
        setFormOptions({ ...formOptions, [field]: checked });
    };

    const handleSave = () => {
        onSave(formOptions);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Import Options</DialogTitle>
                    <DialogDescription>
                        Configure special processing options for your import
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Import Processing Options */}
                    <div>
                        <h3 className="font-semibold mb-3">Import Processing</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="force_add"
                                    checked={formOptions.force_add}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('force_add', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="force_add" className="font-medium cursor-pointer">
                                        Force Add All Records
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Don't search for matching records. Add all as new. No updating existing records.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="email_only"
                                    checked={formOptions.email_only}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('email_only', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="email_only" className="font-medium cursor-pointer">
                                        Email Only Import
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Generate first and last names from email addresses (e.g., chris@example.com → First: Chris, Last: Lead)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="add_optout"
                                    checked={formOptions.add_optout}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('add_optout', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="add_optout" className="font-medium cursor-pointer">
                                        Add Opt-Out Prefix
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Add @OPT_OUT_ prefix to email addresses to prevent sending emails
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="dont_contact"
                                    checked={formOptions.dont_contact}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('dont_contact', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="dont_contact" className="font-medium cursor-pointer">
                                        Do Not Contact
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Add @Do_Not_Contact_ prefix for importing opt-out lists from other systems
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Name Parsing Options */}
                    <div>
                        <h3 className="font-semibold mb-3">Name Parsing</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="fixname1"
                                    checked={formOptions.fixname1}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('fixname1', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="fixname1" className="font-medium cursor-pointer">
                                        Format: First Last
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Parse names like "John Brown" into separate first and last name fields
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="fixname2"
                                    checked={formOptions.fixname2}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('fixname2', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="fixname2" className="font-medium cursor-pointer">
                                        Format: Last, First
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Parse names like "Brown, John" into separate first and last name fields
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="fixname3"
                                    checked={formOptions.fixname3}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('fixname3', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="fixname3" className="font-medium cursor-pointer">
                                        Format: Joint Names (First & First)
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Parse names like "John & Martha" - First: John, Second First: Martha, same last name for both
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Address Parsing Options */}
                    <div>
                        <h3 className="font-semibold mb-3">Address Parsing</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="fixaddress1"
                                    checked={formOptions.fixaddress1}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('fixaddress1', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="fixaddress1" className="font-medium cursor-pointer">
                                        Format: City, State Zip (with comma)
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Parse "San Diego, CA 92101" into separate City, State, and Zip fields
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="fixaddress2"
                                    checked={formOptions.fixaddress2}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('fixaddress2', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="fixaddress2" className="font-medium cursor-pointer">
                                        Format: City State Zip (no comma)
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Parse "San Diego CA 92101" into separate City, State, and Zip fields
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Checkbox
                                    id="fixaddress3"
                                    checked={formOptions.fixaddress3}
                                    onCheckedChange={(checked) =>
                                        handleCheckboxChange('fixaddress3', checked as boolean)
                                    }
                                />
                                <div className="flex-1">
                                    <Label htmlFor="fixaddress3" className="font-medium cursor-pointer">
                                        Format: Full Address
                                    </Label>
                                    <p className="text-sm text-gray-500">
                                        Parse "101 Main St, San Diego CA 92101" into Address, City, State, and Zip fields
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save Options
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImportOptionsModal;

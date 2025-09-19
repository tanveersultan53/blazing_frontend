import AddPersonForm from './AddPersonForm';
import PageHeader from '@/components/PageHeader';
import { useSearchParams } from 'react-router-dom';
import { useBreadcrumbs } from '@/hooks/usePageTitle';
import { useMemo } from 'react';

const AddPerson = () => {
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type');
    const pageTitle = type === 'contact' ? 'Add Contact' : 'Add Referal Partner';
    const pageDescription = type === 'contact' ? 'Add a new contact to your contact list' : 'Add a new referal partner to your contact list';

    // Memoize breadcrumbs to prevent infinite loops
    const breadcrumbs = useMemo(() => [
        { label: 'Dashboard', path: '/user-dashboard?tab=' + type },
        { label: pageTitle }
    ], []);

    useBreadcrumbs(breadcrumbs);

    return (
        <div className="space-y-6">
            <PageHeader
                title={pageTitle}
                description={pageDescription}
            />
            <div className="pb-3">
                <AddPersonForm type={type} />
            </div>
        </div>
    );
};

export default AddPerson;
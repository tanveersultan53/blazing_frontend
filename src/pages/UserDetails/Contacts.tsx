import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { useState } from "react";
// import { useSearchParams } from "react-router-dom";

const Contacts = ({
    tab,
}: {
    tab: 'contact' | 'referal_partner';

}) => {
    // const [activeTab, setActiveTab] = useState<'contact' | 'referal_partner'>(tab);



    return (
        <Card className="mb-12">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle>{tab === 'contact' ? 'Contact List' : 'Referal Partner List'}</CardTitle>
                    <CardDescription>Following are the {tab === 'contact' ? 'contact' : 'referal partner'} list add by this user. </CardDescription>
                </div>
            </CardHeader>
        </Card>
    )
}

export default Contacts;
import ComponentCard from '@/components/common/ComponentCard'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import React from 'react'
import UserDetails from './UserDetails'
import { getBranches } from '@/lib/actions/util.action'

const UserDetailsPage = async ({ params }: { params: Promise<{ id: string }> }) => {

    const { id } = await params
    const branches = await getBranches(); // Server-side fetch

    return (
        <div className="space-y-1">
            <PageBreadcrumb pageTitle="User Details" />
            <ComponentCard title="User">
                <div className="flex flex-col gap-4 mb-4">
                    <UserDetails userId={id} branches={branches} />
                </div>
            </ComponentCard>
        </div>
    )
}

export default UserDetailsPage
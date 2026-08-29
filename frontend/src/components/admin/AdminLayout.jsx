import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout() {
    return (
        <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Header */}
                <AdminHeader />

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

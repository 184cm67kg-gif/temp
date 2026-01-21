import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search, UserCircle } from 'lucide-react';
import { useStore } from '../../store/scenarioStore';

export function MainLayout() {
    const { currentUser } = useStore();

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm z-10">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <span>Loggy</span>
                        <span className="mx-2">/</span>
                        <span className="text-foreground font-medium">Dashboard</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-secondary/50 border border-border rounded-full py-1.5 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary outline-none w-64 transition-all"
                            />
                        </div>

                        <button className="relative p-2 rounded-full hover:bg-secondary/80 transition-colors">
                            <Bell className="w-5 h-5 text-gray-300" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </button>

                        <div className="flex items-center gap-2 pl-4 border-l border-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{currentUser?.name}</p>
                                <p className="text-[10px] text-muted-foreground">{currentUser?.jobTitle}</p>
                            </div>
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10">
                                {currentUser?.name?.[0]}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Content Area */}
                <main className="flex-1 overflow-auto p-0 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

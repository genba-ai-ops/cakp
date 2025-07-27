'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Search,
  HeadphonesIcon,
  FileText,
  Settings,
  Users,
  BarChart3,
  FileCheck
} from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: Home },
  { name: 'ナレッジ検索', href: '/knowledge', icon: Search },
  { name: '対話支援', href: '/support', icon: HeadphonesIcon },
  { name: '承認管理', href: '/approvals', icon: FileCheck },
  { name: 'レポート', href: '/reports', icon: BarChart3 },
  { name: 'ユーザー管理', href: '/users', icon: Users },
  { name: '設定', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">CAKP</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
              )}
            >
              <item.icon
                className={cn(
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-white',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
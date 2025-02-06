'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

interface UserSettings {
    refreshInterval: string
}

const REFRESH_OPTIONS = [
    { value: '0 0 * * *', label: 'Every day' },
    { value: '0 0 */5 * *', label: 'Every 5 days' },
    { value: '0 0 */15 * *', label: 'Every 15 days' },
    { value: '0 0 1 * *', label: 'Once a month' }
]

export default function SettingsPage() {
    const { user } = useAuth()
    const [settings, setSettings] = useState<UserSettings>({ refreshInterval: '0 0 * * *' })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            loadSettings()
        }
    }, [user])

    const loadSettings = async () => {
        if (!user) return

        try {
            setIsLoading(true)
            setError(null)

            const settingsRef = doc(db, 'userSettings', user.uid)
            const settingsDoc = await getDoc(settingsRef)

            if (settingsDoc.exists()) {
                setSettings(settingsDoc.data() as UserSettings)
            }
        } catch (err) {
            console.error('Error loading settings:', err)
            setError('Failed to load settings')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user) return

        try {
            setIsSaving(true)
            setError(null)
            setSaveMessage(null)

            const settingsRef = doc(db, 'userSettings', user.uid)
            await setDoc(settingsRef, settings)

            setSaveMessage('Settings saved successfully')
            setTimeout(() => setSaveMessage(null), 3000)
        } catch (err) {
            console.error('Error saving settings:', err)
            setError('Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-[32px] font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Configure your preferences</p>
            </div>

            <div className="max-w-[512px]">
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {saveMessage && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-500 text-sm">
                        {saveMessage}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-base font-medium text-gray-900 mb-2">
                            Auto-Refresh Interval
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            Choose how often you want your vehicle listings to be automatically refreshed.
                        </p>
                        <select
                            value={settings.refreshInterval}
                            onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: e.target.value }))}
                            className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {REFRESH_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="rounded-xl px-4 h-10 bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </div>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
} 
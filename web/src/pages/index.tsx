import { useState, useEffect } from 'react'
import Head from 'next/head'
import { QrCode, Smartphone, Wifi, Settings, Plus, Download } from 'lucide-react'
import { ESimService } from '../services/esim-service'
import { QRCodeGenerator } from '../components/QRCodeGenerator'
import { ProfileCard } from '../components/ProfileCard'
import { ProvisionModal } from '../components/ProvisionModal'

interface ESimProfile {
  iccid: string
  name: string
  provider: string
  status: 'active' | 'inactive' | 'pending'
  activatedDate?: Date
}

export default function Home() {
  const [profiles, setProfiles] = useState<ESimProfile[]>([])
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const data = await ESimService.getProfiles()
      setProfiles(data)
    } catch (error) {
      console.error('Failed to load profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProvision = async (activationCode: string) => {
    try {
      await ESimService.provisionProfile(activationCode)
      await loadProfiles()
      setShowProvisionModal(false)
    } catch (error) {
      console.error('Provisioning failed:', error)
    }
  }

  return (
    <>
      <Head>
        <title>NexoraSIM eSIM Manager</title>
        <meta name="description" content="Enterprise eSIM Management Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Smartphone className="h-8 w-8 text-primary-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  NexoraSIM eSIM Manager
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowProvisionModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Profile
                </button>
                <Settings className="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Smartphone className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Profiles</p>
                  <p className="text-2xl font-semibold text-gray-900">{profiles.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Wifi className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Profiles</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profiles.filter(p => p.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <QrCode className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">QR Codes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {profiles.filter(p => p.status !== 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">eSIM Profiles</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading profiles...</p>
              </div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No eSIM profiles found</p>
                <button
                  onClick={() => setShowProvisionModal(true)}
                  className="btn-primary mt-4"
                >
                  Add Your First Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.iccid}
                    profile={profile}
                    onRefresh={loadProfiles}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {showProvisionModal && (
          <ProvisionModal
            onClose={() => setShowProvisionModal(false)}
            onProvision={handleProvision}
          />
        )}
      </div>
    </>
  )
}
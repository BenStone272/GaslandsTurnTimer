import { useNavigate } from 'react-router-dom'
import { SettingsModal } from '../components/SettingsModal'
import { loadSettings, saveSettings } from '../utils/storage'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <SettingsModal
      initialSettings={loadSettings()}
      onClose={() => navigate('/')}
      onSave={(settings) => {
        saveSettings(settings)
        navigate('/')
      }}
    />
  )
}

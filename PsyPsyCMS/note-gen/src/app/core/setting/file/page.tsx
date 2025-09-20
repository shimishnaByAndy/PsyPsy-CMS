'use client'
import { SettingWorkspace } from "./setting-workspace"
import { SettingAssets } from "./setting-assets"
import { SettingType } from "../components/setting-base"
import { FolderOpen } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function SettingFilePage() {
  const t = useTranslations('settings.file')

  return (
    <SettingType
      id="file"
      title={t('title')}
      icon={<FolderOpen className="w-5 h-5" />}
    >
      <SettingWorkspace />
      <SettingAssets />
    </SettingType>
  )
}

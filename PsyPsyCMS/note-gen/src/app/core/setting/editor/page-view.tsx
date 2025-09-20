'use client'
import { SettingPanel } from "../components/setting-base";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from "react";
import { Store } from "@tauri-apps/plugin-store";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


export default function PageView() {
  const t = useTranslations('settings.editor');
  const [pageView, setPageView] = useState<'immersiveView' | 'panoramaView'>('immersiveView')

  useEffect(() => {
    async function init() {
      const store = await Store.load('store.json');
      const pageView = await store.get<'immersiveView' | 'panoramaView'>('pageView') || 'immersiveView'
      setPageView(pageView)
    }
    init()
  }, [])

  async function setPositionHandler(state: 'immersiveView' | 'panoramaView') {
    const store = await Store.load('store.json');
    await store.set('pageView', state)
    setPageView(state)
  }

  return  <SettingPanel title={t('pageView')} desc={t('pageViewDesc')}>
    <Tabs defaultValue="immersiveView" value={pageView} onValueChange={(value) => setPositionHandler(value as 'immersiveView' | 'panoramaView')}>
      <TabsList className="grid md:w-[360px] grid-cols-2">
        <TabsTrigger value="immersiveView">{t('pageViewOptions.immersiveView')}</TabsTrigger>
        <TabsTrigger value="panoramaView">{t('pageViewOptions.panoramaView')}</TabsTrigger>
      </TabsList>
    </Tabs>
  </SettingPanel>
}
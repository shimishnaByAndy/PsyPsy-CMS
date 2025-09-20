'use client'
import { Input } from "@/components/ui/input";
import { FormItem, SettingPanel, SettingRow } from "../components/setting-base";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useSettingStore from "@/stores/setting";
import { Store } from "@tauri-apps/plugin-store";
import useSyncStore from "@/stores/sync";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenBroswer } from "@/components/open-broswer";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Button } from "@/components/ui/button";
import { checkSyncRepoState, createSyncRepo, getUserInfo } from "@/lib/github";
import { RepoNames, SyncStateEnum } from "@/lib/github.types";
import { DatabaseBackup, Eye, EyeOff, Plus, RefreshCcw } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

dayjs.extend(relativeTime)

export function GithubSync() {
  const t = useTranslations();
  const { accessToken,
    setAccessToken,
    autoSync,
    setAutoSync,
    primaryBackupMethod,
    setPrimaryBackupMethod,
    githubCustomSyncRepo,
    setGithubCustomSyncRepo
  } = useSettingStore()
  const {
    syncRepoState,
    setSyncRepoState,
    syncRepoInfo,
    setSyncRepoInfo
  } = useSyncStore()

  const [accessTokenVisible, setAccessTokenVisible] = useState<boolean>(false)

  // 获取实际使用的仓库名称
  const getRepoName = () => {
    return githubCustomSyncRepo.trim() || RepoNames.sync
  }

  // 检查 GitHub 仓库状态（仅检查，不创建）

  async function checkGithubRepos() {
    try {
      setSyncRepoState(SyncStateEnum.checking)
      // 先清空之前的仓库信息
      setSyncRepoInfo(undefined)
      
      await getUserInfo();
      const repoName = getRepoName()
      const syncRepo = await checkSyncRepoState(repoName)
      
      if (syncRepo) {
        setSyncRepoInfo(syncRepo)
        setSyncRepoState(SyncStateEnum.success)
      } else {
        setSyncRepoInfo(undefined)
        setSyncRepoState(SyncStateEnum.fail)
      }
    } catch (err) {
      console.error('Failed to check GitHub repos:', err)
      setSyncRepoInfo(undefined)
      setSyncRepoState(SyncStateEnum.fail)
    }
  }

  // 手动创建仓库
  async function createGithubRepo() {
    try {
      setSyncRepoState(SyncStateEnum.creating)
      const repoName = getRepoName()
      const info = await createSyncRepo(repoName, true)
      if (info) {
        setSyncRepoInfo(info)
        setSyncRepoState(SyncStateEnum.success)
      } else {
        setSyncRepoState(SyncStateEnum.fail)
      }
    } catch (err) {
      console.error('Failed to create GitHub repo:', err)
      setSyncRepoState(SyncStateEnum.fail)
    }
  }

  async function tokenChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    if (value === '') {
      setSyncRepoState(SyncStateEnum.fail)
      setSyncRepoInfo(undefined)
    }
    setAccessToken(value)
    const store = await Store.load('store.json');
    await store.set('accessToken', value)
  }

  useEffect(() => {
    async function init() {
      const store = await Store.load('store.json');
      const token = await store.get<string>('accessToken')
      if (token) {
        setAccessToken(token)
      } else {
        setAccessToken('')
      }
    }
    init()
  }, [])


  return (
    <div className="mt-4">
      <SettingRow>
        <FormItem title="Github Access Token" desc={t('settings.sync.newTokenDesc')}>
          <OpenBroswer url="https://github.com/settings/tokens/new" title={t('settings.sync.newToken')} className="mb-2" />
          <div className="flex gap-2">
            <Input value={accessToken} onChange={tokenChangeHandler} type={accessTokenVisible ? 'text' : 'password'} />
            <Button variant="outline" size="icon" onClick={() => setAccessTokenVisible(!accessTokenVisible)}>
              {accessTokenVisible ? <Eye /> : <EyeOff />}
            </Button>
          </div>
        </FormItem>
      </SettingRow>
      <SettingRow>
        <FormItem title={t('settings.sync.customSyncRepo')} desc={t('settings.sync.customSyncRepoDesc')}>
          <Input 
            value={githubCustomSyncRepo} 
            onChange={(e) => {
              setGithubCustomSyncRepo(e.target.value)
            }}
            placeholder={RepoNames.sync}
          />
        </FormItem>
      </SettingRow>
      <SettingRow>
        <FormItem title={t('settings.sync.repoStatus')}>
          <Card>
            <CardHeader className={`${syncRepoInfo ? 'border-b' : ''}`}>
              <CardTitle className="flex justify-between items-center">
                <div className="flex gap-2 items-center">
                  <DatabaseBackup className="size-4" />
                  {getRepoName()}（{ syncRepoInfo?.private === false ? t('settings.sync.public') : t('settings.sync.private') }）
                </div>
                <Badge className={`${syncRepoState === SyncStateEnum.success ? 'bg-green-800' : 'bg-red-800'}`}>{syncRepoState}</Badge>
              </CardTitle>
              <CardDescription>
                <span>{t('settings.sync.syncRepoDesc')}</span>
              </CardDescription>
              {/* 手动检测和创建按钮 */}
              {accessToken && (
                <div className="mt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={checkGithubRepos}
                    disabled={syncRepoState === SyncStateEnum.checking}
                  >
                    <RefreshCcw className="size-4 mr-1" />
                    {syncRepoState === SyncStateEnum.checking ? t('settings.sync.checking') : t('settings.sync.checkRepo')}
                  </Button>
                  {syncRepoState === SyncStateEnum.fail && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={createGithubRepo}
                    >
                      <Plus className="size-4 mr-1" />
                      {t('settings.sync.createRepo')}
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
            {
              syncRepoInfo &&
              <CardContent className="flex items-center gap-4 mt-4">
                <Avatar className="size-12"  >
                  <AvatarImage src={syncRepoInfo?.owner.avatar_url || ''} />
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold mb-1">
                    <OpenBroswer title={syncRepoInfo?.full_name || ''} url={syncRepoInfo?.html_url || ''} />
                  </h3>
                  <CardDescription className="flex">
                    <p className="text-zinc-500 leading-6">{t('settings.sync.createdAt', { time: dayjs(syncRepoInfo?.created_at).fromNow() })}，</p>
                    <p className="text-zinc-500 leading-6">{t('settings.sync.updatedAt', { time: dayjs(syncRepoInfo?.updated_at).fromNow() })}。</p>
                  </CardDescription>
                </div>
              </CardContent>
            }
          </Card>
        </FormItem>
      </SettingRow>
      {
        syncRepoInfo &&
        <>
          <SettingPanel title={t('settings.sync.autoSync')} desc={t('settings.sync.autoSyncDesc')}>
            <Select
              value={autoSync}
              onValueChange={(value) => setAutoSync(value)}
              disabled={!accessToken || syncRepoState !== SyncStateEnum.success}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('settings.sync.autoSyncOptions.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">{t('settings.sync.autoSyncOptions.disabled')}</SelectItem>
                <SelectItem value="10">{t('settings.sync.autoSyncOptions.10s')}</SelectItem>
                <SelectItem value="30">{t('settings.sync.autoSyncOptions.30s')}</SelectItem>
                <SelectItem value="60">{t('settings.sync.autoSyncOptions.1m')}</SelectItem>
                <SelectItem value="300">{t('settings.sync.autoSyncOptions.5m')}</SelectItem>
                <SelectItem value="1800">{t('settings.sync.autoSyncOptions.30m')}</SelectItem>
              </SelectContent>
            </Select>
          </SettingPanel>
        </>
      }
      <SettingRow className="mb-4">
        {primaryBackupMethod === 'github' ? (
          <Button disabled variant="outline">
            {t('settings.sync.isPrimaryBackup', { type: 'Github' })}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            onClick={() => setPrimaryBackupMethod('github')}
            disabled={!accessToken || syncRepoState !== SyncStateEnum.success}
          >
            {t('settings.sync.setPrimaryBackup')}
          </Button>
        )}
      </SettingRow>
    </div>
  )
}
"use client"
import {TooltipProvider } from "@/components/ui/tooltip"
import {
  FilePlus, 
  FolderGit2, 
  FolderPlus, 
  FolderSync, 
  LoaderCircle,
  SortAsc,
  SortDesc,
  Clock,
  Calendar,
  ArrowDownAZ,
  ChevronsDownUp,
  ChevronsUpDown,
  BookA,
} from "lucide-react"
import * as React from "react"
import { TooltipButton } from "@/components/tooltip-button"
import useArticleStore from "@/stores/article"
import { open } from '@tauri-apps/plugin-shell';
import useSettingStore from "@/stores/setting"
import { RepoNames } from "@/lib/github.types"
import { useTranslations } from "next-intl"
import { debounce } from "lodash-es"
import useVectorStore from "@/stores/vector"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useUsername from "@/hooks/use-username"

export function FileToolbar() {
  const { newFolder, loadFileTree, newFile, fileTreeLoading, sortType, setSortType, sortDirection, setSortDirection, toggleAllFolders, collapsibleList } = useArticleStore()
  const { primaryBackupMethod } = useSettingStore()
  const { processAllDocuments, isProcessing, isVectorDbEnabled, setVectorDbEnabled } = useVectorStore()
  const t = useTranslations('article.file.toolbar')

  const username = useUsername()

  const debounceNewFile = debounce(newFile, 200)
  const debounceNewFolder = debounce(newFolder, 200)

  async function openFolder() {
    switch (primaryBackupMethod) {
      case 'github':
        open(`https://github.com/${username}/${RepoNames.sync}`)
        break;
      case 'gitee':
        open(`https://gitee.com/${username}/${RepoNames.sync}`)
        break;
      case 'gitlab':
        open(`https://gitlab.com/${username}/${RepoNames.sync}`)
        break;
    }
  }

  return (
    <div className="flex justify-between items-center h-12 border-b px-2">
      <div>
        {/* 新建 */}
        <TooltipButton icon={<FilePlus />} tooltipText={t('newArticle')} onClick={debounceNewFile} />
        {/* 新建文件夹 */}
        <TooltipButton icon={<FolderPlus />} tooltipText={t('newFolder')} onClick={debounceNewFolder} />
        {/* 向量数据库 */}
        <TooltipButton 
          icon={isProcessing ? <LoaderCircle className="animate-spin size-4" /> : <BookA className={isVectorDbEnabled ? "text-primary" : ""} />} 
          tooltipText={isProcessing ? t('processingVectors') : (isVectorDbEnabled ? t('calculateVectors') : t('enableVectorDb'))} 
          onClick={isVectorDbEnabled ? processAllDocuments : () => setVectorDbEnabled(true)}
          disabled={isProcessing} 
        />
        {/* 同步 */}
        {
          primaryBackupMethod && username ?
            <TooltipButton
              icon={fileTreeLoading ? <LoaderCircle className="animate-spin size-4" /> : <FolderGit2 />}
              tooltipText={fileTreeLoading ? t('loadingSync') : t('accessRepo')}
              disabled={!username}
              onClick={openFolder}
            />
            : null
        }
      </div>
      <div>
        <TooltipProvider>
          {/* 排序 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="inline-flex items-center">
                <TooltipButton icon={sortDirection === 'asc' ? <SortAsc className={`h-4 w-4 ${sortType !== 'none' ? 'text-primary' : ''}`} /> : <SortDesc className={`h-4 w-4 ${sortType !== 'none' ? 'text-primary' : ''}`} />} tooltipText={t('sort')} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortType('name')} className={sortType === 'name' ? 'bg-accent' : ''}>
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                {t('sortByName')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType('created')} className={sortType === 'created' ? 'bg-accent' : ''}>
                <Calendar className="mr-2 h-4 w-4" />
                {t('sortByCreated')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortType('modified')} className={sortType === 'modified' ? 'bg-accent' : ''}>
                <Clock className="mr-2 h-4 w-4" />
                {t('sortByModified')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')} className="border-t mt-1 pt-1">
                {sortDirection === 'asc' ? (
                  <>
                    <SortDesc className="mr-2 h-4 w-4" />
                    {t('sortDesc')}
                  </>
                ) : (
                  <>
                    <SortAsc className="mr-2 h-4 w-4" />
                    {t('sortAsc')}
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
        {/* 折叠/展开 */}
        <TooltipButton 
          icon={collapsibleList.length > 0 ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />} 
          tooltipText={collapsibleList.length > 0 ? t('collapseAll') : t('expandAll')} 
          onClick={toggleAllFolders} 
        />
        {/* 刷新 */}
        <TooltipButton icon={<FolderSync />} tooltipText={t('refresh')} onClick={loadFileTree} />
      </div>
    </div>
  )
}

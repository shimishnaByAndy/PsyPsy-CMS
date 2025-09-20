import { TooltipButton } from "@/components/tooltip-button"
import { insertMark, Mark } from "@/db/marks"
import { useTranslations } from 'next-intl'
import { fetchAiDesc, fetchAiDescByImage } from "@/lib/ai"
import ocr from "@/lib/ocr"
import useMarkStore from "@/stores/mark"
import useTagStore from "@/stores/tag"
import { BaseDirectory, copyFile, exists, mkdir, readFile } from "@tauri-apps/plugin-fs"
import { ImagePlus } from "lucide-react"
import useSettingStore from "@/stores/setting"
import { v4 as uuid } from 'uuid'
import { open } from '@tauri-apps/plugin-dialog';
import { uploadImage } from "@/lib/imageHosting"

export function ControlImage() {
  const t = useTranslations();
  const { currentTagId, fetchTags, getCurrentTag } = useTagStore()
  const { primaryModel, primaryImageMethod } = useSettingStore()
  const { fetchMarks, addQueue, setQueue, removeQueue } = useMarkStore()

  async function selectImages() {
    const filePaths = await open({
      multiple: true,
      directory: false,
      filters: [{
        name: 'Image',
        extensions: ['png', 'jpeg', 'jpg', 'gif', 'webp','svg', 'bmp', 'ico']
      }]
    });
    if (!filePaths) return
    filePaths.forEach(async (path) => {
      await upload(path)
    })
  }

  async function upload(path: string) {
    const queueId = uuid()
    addQueue({ queueId, progress: t('record.mark.progress.cacheImage'), type: 'image', startTime: Date.now() })
    const ext = path.substring(path.lastIndexOf('.') + 1)
    const isImageFolderExists = await exists('image', { baseDir: BaseDirectory.AppData})
    if (!isImageFolderExists) {
      await mkdir('image', { baseDir: BaseDirectory.AppData})
    }
    await copyFile(path, `image/${queueId}.${ext}`, { toPathBaseDir: BaseDirectory.AppData})
    const fileData = await readFile(path)
    const filename = `${queueId}.${ext}`
    let content = ''
    let desc = ''
    if (primaryImageMethod === 'vlm') {
      // 使用 VLM 识别图片
      setQueue(queueId, { progress: t('record.mark.progress.aiAnalysis') });
      const base64 = `data:image/${ext};base64,${Buffer.from(fileData).toString('base64')}`
      content = await fetchAiDescByImage(base64) || 'VLM Error'
      desc = content
    } else {
      // 使用 OCR 识别图片
      setQueue(queueId, { progress: t('record.mark.progress.ocr') });
      content = await ocr(`image/${filename}`)
      setQueue(queueId, { progress: t('record.mark.progress.aiAnalysis') });
      if (primaryModel) {
        desc = await fetchAiDesc(content).then(res => res ? res : content) || content
      } else {
        desc = content
      }
    }
    
    const mark: Partial<Mark> = {
      tagId: currentTagId,
      type: 'image',
      content,
      url: filename,
      desc,
    }
    setQueue(queueId, { progress: t('record.mark.progress.uploadImage') });
    // 上传图片
    const file = new File([new Blob([fileData])], filename, { type: `image/${ext}` })
    const url = await uploadImage(file)
    if (url) {
      mark.url = url
    }
    removeQueue(queueId)
    await insertMark(mark)
    await fetchMarks()
    await fetchTags()
    getCurrentTag()
  }

  return (
    <TooltipButton icon={<ImagePlus />} tooltipText={t('record.mark.type.image')} onClick={selectImages} />
  )
}
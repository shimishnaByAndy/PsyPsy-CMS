'use client'

import React, { useEffect } from "react"
import { FileToolbar } from "./file-toolbar"
import { FileManager } from "./file-manager"
import { WorkspaceSelector } from "./workspace-selector"
import useArticleStore from "@/stores/article"

export function FileSidebar() {
  const { initCollapsibleList } = useArticleStore()

  useEffect(() => {
    initCollapsibleList()
  }, [])

  return (
    <div className="w-full h-screen flex flex-col">
      <FileToolbar />
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <FileManager />
      </div>
      <WorkspaceSelector />
    </div>
  )
}
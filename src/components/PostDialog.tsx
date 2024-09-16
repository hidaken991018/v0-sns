// app/components/PostDialog.tsx

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface PostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated: () => void
}

export default function PostDialog({ open, onOpenChange, onPostCreated }: PostDialogProps) {
  const [content, setContent] = useState('')
  const { session } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    const { error } = await supabase
      .from('posts')
      .insert({ content, user_id: session.user.id })

    if (error) {
      console.error('Error creating post:', error)
    } else {
      setContent('')
      onOpenChange(false)
      onPostCreated()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>新規投稿を作成</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="何を共有しますか？"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          <Button type="submit" disabled={!content.trim()}>投稿する</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
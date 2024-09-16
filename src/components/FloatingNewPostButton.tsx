
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'

interface FloatingNewPostButtonProps {
  onClick: () => void
}

export function FloatingNewPostButton({ onClick }: FloatingNewPostButtonProps) {
  return (
    <Button
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
      onClick={onClick}
      aria-label="新規投稿を作成"
    >
      <Plus className="w-6 h-6" />
    </Button>
  )
}
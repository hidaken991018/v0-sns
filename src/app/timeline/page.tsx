'use client'

import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAuth } from '@/contexts/AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PostDialog from '@/components/PostDialog'
import { PostCard } from '@/components/PostCard'
import { FloatingNewPostButton } from '@/components/FloatingNewPostButton'
import { usePosts } from '@/hooks/usePosts'
import { supabase } from '@/lib/supabase'

export default function Timeline() {
  const [sortBy, setSortBy] = useState('latest')
  const [filterTag, setFilterTag] = useState('')
  const [page, setPage] = useState(1)
  const { session } = useAuth()
  const { posts, isLoading, isError, mutate, hasMore } = usePosts(sortBy, filterTag, page)
  const [allPosts, setAllPosts] = useState<any[]>([])
  const [ref, inView] = useInView({
    threshold: 0,
    rootMargin: '100px',
  })
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)

  useEffect(() => {
    setPage(1)
    setAllPosts([])
  }, [sortBy, filterTag])

  useEffect(() => {
    if (posts) {
      setAllPosts(prevPosts => {
        const newPosts = posts.filter(post => !prevPosts.some(p => p.id === post.id))
        return [...prevPosts, ...newPosts]
      })
    }
  }, [posts])

  useEffect(() => {
    if (inView && !isLoading && hasMore) {
      setPage(prevPage => prevPage + 1)
    }
  }, [inView, isLoading, hasMore])

  const handleLike = async (postId: string) => {
    if (!session) return

    const postToUpdate = allPosts.find(p => p.id === postId)
    if (!postToUpdate) return

    const isCurrentlyLiked = postToUpdate.is_liked

    // 楽観的UI更新
    setAllPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
            ...post,
            is_liked: !isCurrentlyLiked,
            likes_count: isCurrentlyLiked ? post.likes_count - 1 : post.likes_count + 1
          }
          : post
      )
    )

    if (isCurrentlyLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', session.user.id)
        .eq('post_id', postId)

      if (error) {
        console.error('Error removing like:', error)
        mutate()
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: session.user.id, post_id: postId })

      if (error) {
        console.error('Error adding like:', error)
        mutate()
      }
    }
  }

  const handleComment = (postId: string) => {
    // コメント機能の実装（この例では省略）
    console.log('Comment on post:', postId)
  }

  const handleShare = (postId: string) => {
    // 共有機能の実装（この例では省略）
    console.log('Share post:', postId)
  }

  const handleNewPost = () => {
    setIsPostDialogOpen(true)
  }

  if (!session) return <div>ログインしてください</div>

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">タイムライン</h1>
        <div className="flex space-x-4">
          {/* <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新</SelectItem>
              <SelectItem value="popular">人気</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterTag} onValueChange={setFilterTag}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="タグでフィルター" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">すべて</SelectItem>
              <SelectItem value="Decentraland">Decentraland</SelectItem>
              <SelectItem value="The Sandbox">The Sandbox</SelectItem>
              <SelectItem value="Roblox">Roblox</SelectItem>
            </SelectContent>
          </Select> */}
        </div>
      </div>

      {isError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">エラー:</strong>
          <span className="block sm:inline"> 投稿の取得中にエラーが発生しました。</span>
        </div>
      )}

      <div className="space-y-4">
        {allPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))}
      </div>

      {isLoading && <div className="text-center">読み込み中...</div>}
      {!isLoading && hasMore && <div ref={ref} className="h-10" />}
      {!isLoading && !hasMore && <div className="text-center">これ以上の投稿はありません</div>}

      <FloatingNewPostButton onClick={handleNewPost} />
      <PostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} onPostCreated={() => mutate()} />
    </div>
  )
}
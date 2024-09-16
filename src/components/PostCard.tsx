import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2 } from 'lucide-react'

type Post = {
  id: string
  content: string
  created_at: string
  metaverse_tags: string[]
  image_url: string | null
  likes_count: number
  is_liked: boolean
  user: {
    id: string
    username: string
    avatar_url: string
  }
}

interface PostCardProps {
  post: Post
  onLike: (postId: string) => void
  onComment: (postId: string) => void
  onShare: (postId: string) => void
}

export function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar className="cursor-pointer">
              <AvatarImage src={post.user.avatar_url} alt={post.user.username} />
              <AvatarFallback>{post.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link href={`/profile/${post.user.id}`}>
              <CardTitle className="text-lg cursor-pointer hover:underline">{post.user.username}</CardTitle>
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url} alt="Post image" className="rounded-lg max-h-96 w-full object-cover" />
        )}
        {post.metaverse_tags && post.metaverse_tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.metaverse_tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-start space-x-4 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onLike(post.id)}
          className={`flex items-center ${post.is_liked ? 'text-pink-500' : 'text-gray-500'}`}
        >
          <Heart className="mr-2 h-4 w-4" fill={post.is_liked ? 'currentColor' : 'none'} />
          <span>{post.likes_count}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onComment(post.id)} className="flex items-center">
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>コメント</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onShare(post.id)} className="flex items-center">
          <Share2 className="mr-2 h-4 w-4" />
          <span>共有</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
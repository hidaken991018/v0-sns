import useSWR from 'swr';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Post = {
  id: string;
  content: string;
  created_at: string;
  metaverse_tags: string[];
  image_url: string | null;
  likes_count: number;
  is_liked: boolean;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
};

type FetchPostsParams = {
  sortBy: string;
  filterTag: string;
  page: number;
  userId: string | undefined;
};

const POSTS_PER_PAGE = 20;

const fetchPosts = async ({
  sortBy,
  filterTag,
  page,
  userId,
}: FetchPostsParams): Promise<Post[]> => {
  let query = supabase.from('posts').select(`
      id,
      content,
      created_at,
      metaverse_tags,
      image_url,
      user:profiles!posts_user_id_fkey(id, username, avatar_url),
      likes(count)
    `);

  if (filterTag) {
    query = query.contains('metaverse_tags', [filterTag]);
  }

  if (sortBy === 'latest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'popular') {
    query = query.order('likes(count)', { ascending: false });
  }

  const { data: posts, error } = await query.range(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE - 1
  );

  if (error) {
    throw new Error('投稿の取得中にエラーが発生しました。');
  }

  // ユーザーのいいね状態を取得
  const { data: userLikes, error: likesError } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId);

  if (likesError) {
    console.error('いいね状態の取得中にエラーが発生しました:', likesError);
  }

  const userLikedPostIds = new Set(
    userLikes?.map((like) => like.post_id) || []
  );

  return posts.map((post) => ({
    ...post,
    user: Array.isArray(post.user) ? post.user[0] : post.user,
    likes_count: post.likes[0]?.count || 0,
    is_liked: userLikedPostIds.has(post.id),
  }));
};

export function usePosts(sortBy: string, filterTag: string, page: number) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const { data, error, mutate } = useSWR(
    ['posts', sortBy, filterTag, page, userId],
    () => fetchPosts({ sortBy, filterTag, page, userId }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    posts: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
    hasMore: data ? data.length === POSTS_PER_PAGE : false,
  };
}

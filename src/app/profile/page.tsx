'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AvatarProfileManager from '@/components/AvatarProfileManager'
import ImageUploader from '@/components/ImageUploader'

type Profile = {
  id: string
  username: string
  full_name: string
  avatar_url: string
  bio: string
}

type AvatarProfile = {
  id: string
  metaverse_service: string
  service_url: string
  avatar_name: string
  avatar_id: string
  avatar_image_url: string
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarProfiles, setAvatarProfiles] = useState<AvatarProfile[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const { session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
      fetchAvatarProfiles()
    } else {
      router.push('/login')
    }
  }, [session, router])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session?.user?.id)
      .single()
    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
  }

  const fetchAvatarProfiles = async () => {
    const { data, error } = await supabase
      .from('avatar_profiles')
      .select('*')
      .eq('user_id', session?.user?.id)
    if (error) {
      console.error('Error fetching avatar profiles:', error)
    } else {
      setAvatarProfiles(data)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (profile) {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', session?.user?.id)
      if (error) {
        console.error('Error updating profile:', error)
      } else {
        setIsEditing(false)
      }
    }
  }

  // プロフィール画像のアップロード処理
  const handleImageUpload = async (url: string) => {
    if (profile) {
      const updatedProfile = { ...profile, avatar_url: url }
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', session?.user?.id)

      if (error) {
        console.error('Error updating profile image:', error)
      } else {
        setProfile(updatedProfile)
      }
    }
  }

  if (!profile) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback>{profile.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <ImageUploader onUpload={handleImageUpload} currentImageUrl={profile.avatar_url} />
              </div>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Full Name"
              />
              <Input
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="Username"
              />
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Bio"
              />
              <Button type="submit">Save Changes</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback>{profile.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p><strong>Full Name:</strong> {profile.full_name}</p>
                  <p><strong>Username:</strong> {profile.username}</p>
                </div>
              </div>
              <p><strong>Bio:</strong> {profile.bio}</p>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Metaverse Avatars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {avatarProfiles.map(avatar => (
              <Card key={avatar.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{avatar.metaverse_service}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatar.avatar_image_url} alt={avatar.avatar_name} />
                      <AvatarFallback>{avatar.avatar_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p><strong>Name:</strong> {avatar.avatar_name}</p>
                      <p><strong>ID:</strong> {avatar.avatar_id}</p>
                      <a href={avatar.service_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        Visit Service
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Your Avatar Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarProfileManager onUpdate={fetchAvatarProfiles} />
        </CardContent>
      </Card>
    </div>
  )
}
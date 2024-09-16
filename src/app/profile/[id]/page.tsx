'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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

export default function OtherUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarProfiles, setAvatarProfiles] = useState<AvatarProfile[]>([])
  const { id } = useParams()

  useEffect(() => {
    fetchProfile()
    fetchAvatarProfiles()
  }, [id])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
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
      .eq('user_id', id)
    if (error) {
      console.error('Error fetching avatar profiles:', error)
    } else {
      setAvatarProfiles(data)
    }
  }

  if (!profile) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{profile.full_name}'s Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback>{profile.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metaverse Avatars</CardTitle>
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
    </div>
  )
}
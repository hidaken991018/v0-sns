'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type AvatarProfile = {
  id: string
  metaverse_service: string
  service_url: string
  avatar_name: string
  avatar_id: string
  avatar_image_url: string
}

type Props = {
  onUpdate: () => void
}

export default function AvatarProfileManager(props: Props) {
  const { onUpdate } = props
  const { session } = useAuth()
  const [avatarProfiles, setAvatarProfiles] = useState<AvatarProfile[]>([])
  const [newProfile, setNewProfile] = useState<Partial<AvatarProfile>>({})
  const [isEditing, setIsEditing] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      fetchAvatarProfiles()
    }
  }, [session])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewProfile(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing) {
      const { error } = await supabase
        .from('avatar_profiles')
        .update(newProfile)
        .eq('id', isEditing)
      if (error) console.error('Error updating avatar profile:', error)
      else {
        setIsEditing(null)
        fetchAvatarProfiles()
      }
    } else {
      const { error } = await supabase
        .from('avatar_profiles')
        .insert({ ...newProfile, user_id: session?.user?.id })
      if (error) console.error('Error adding avatar profile:', error)
      else fetchAvatarProfiles()
    }
    setNewProfile({})
    onUpdate()
  }

  const handleEdit = (profile: AvatarProfile) => {
    setIsEditing(profile.id)
    setNewProfile(profile)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('avatar_profiles')
      .delete()
      .eq('id', id)
    if (error) console.error('Error deleting avatar profile:', error)
    else fetchAvatarProfiles()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add/Edit Avatar Profile</CardTitle>
          <CardDescription>Manage your metaverse avatar profiles here</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="metaverse_service"
              value={newProfile.metaverse_service || ''}
              onChange={handleInputChange}
              placeholder="Metaverse Service"
              required
            />
            <Input
              name="service_url"
              value={newProfile.service_url || ''}
              onChange={handleInputChange}
              placeholder="Service URL"
            />
            <Input
              name="avatar_name"
              value={newProfile.avatar_name || ''}
              onChange={handleInputChange}
              placeholder="Avatar Name"
              required
            />
            <Input
              name="avatar_id"
              value={newProfile.avatar_id || ''}
              onChange={handleInputChange}
              placeholder="Avatar ID"
            />
            <Input
              name="avatar_image_url"
              value={newProfile.avatar_image_url || ''}
              onChange={handleInputChange}
              placeholder="Avatar Image URL"
            />
            <Button type="submit">{isEditing ? 'Update' : 'Add'} Avatar Profile</Button>
          </form>
        </CardContent>
      </Card>

      {avatarProfiles.map(profile => (
        <Card key={profile.id}>
          <CardHeader>
            <CardTitle>{profile.metaverse_service}</CardTitle>
            <CardDescription>
              <a href={profile.service_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Visit Service
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_image_url} alt={profile.avatar_name} />
              <AvatarFallback>{profile.avatar_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p><strong>Name:</strong> {profile.avatar_name}</p>
              <p><strong>ID:</strong> {profile.avatar_id}</p>
            </div>
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button onClick={() => handleEdit(profile)}>Edit</Button>
            <Button variant="destructive" onClick={() => handleDelete(profile.id)}>Delete</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
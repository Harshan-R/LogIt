//..app/auth/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { validateOrgCode } from '@/lib/validateOrgCode'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgCode, setOrgCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setError('')
    setLoading(true)

    const org = await validateOrgCode(orgCode)
    if (!org) {
      setError('Invalid organization code.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      // You could store org.id in user_metadata (handle later with webhook/RPC)
      router.push('/auth/login')
    }

    setLoading(false)
  }

  return (
    <Card className="max-w-md mx-auto mt-16">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">Sign Up</h2>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          placeholder="Organization Code"
          value={orgCode}
          onChange={(e) => setOrgCode(e.target.value)}
        />
        {error && <p className="text-red-500">{error}</p>}
        <Button onClick={handleSignup} disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </CardContent>
    </Card>
  )
}

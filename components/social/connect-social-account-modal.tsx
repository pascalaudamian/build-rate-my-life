'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  ExternalLink,
  Globe2,
  Link2,
  Loader2,
  Music2,
  X,
  Youtube,
} from 'lucide-react'

type ProviderId =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'spotify'

type ConnectionMetadata = {
  accountName?: string
  username?: string
  avatarUrl?: string
  lastSyncedAt?: string
}

type Connection = {
  id: string
  sourceId: string
  status: string
  metadata?: ConnectionMetadata
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider?: ProviderId | null
  connections?: Connection[]
  onConnected: () => void
}

type ProviderConfig = {
  id: ProviderId
  label: string
  description: string
  icon: typeof Globe2
}

const providerConfig: ProviderConfig[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Connect your Facebook account and permitted data.',
    icon: Globe2,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Connect your Instagram account and permitted activity.',
    icon: Globe2,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Connect your LinkedIn account and professional activity.',
    icon: Link2,
  },
  {
    id: 'x',
    label: 'X',
    description: 'Connect X and analyze the public activity you authorize.',
    icon: ExternalLink,
  },
  {
    id: 'spotify',
    label: 'Spotify',
    description: 'Connect Spotify and analyze your listening activity.',
    icon: Music2,
  },
]

export function ConnectSocialAccountModal({
  open,
  onOpenChange,
  provider,
  connections = [],
  onConnected,
}: Props) {
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderId | null>(provider ?? null)

  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setSelectedProvider(provider ?? null)
      setError(null)
    }
  }, [open, provider])

  const selectedConfig = useMemo(
    () =>
      providerConfig.find(
        (item) => item.id === selectedProvider,
      ) ?? null,
    [selectedProvider],
  )

  if (!open) {
    return null
  }

  const handleConnect = async () => {
    if (!selectedProvider) {
      setError('Please select an account to connect.')
      return
    }

    try {
      setError(null)
      setIsConnecting(true)

      const existingConnection = connections.find(
        (connection) =>
          connection.sourceId === `social:${selectedProvider}` &&
          connection.status !== 'disconnected',
      )

      if (existingConnection) {
        onConnected()
        return
      }

      const response = await fetch(`/api/social/${selectedProvider}/connect`, {
        method: 'POST',
      })

      const body = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(typeof body?.error === 'string' ? body.error : 'This data bridge is not available yet.')
      }

      if (typeof body?.authorizationUrl !== 'string') {
        throw new Error('The provider did not return an authorization link.')
      }

      window.location.assign(body.authorizationUrl)
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : 'Unable to connect this account.',
      )
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connect-social-account-title"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2
              id="connect-social-account-title"
              className="text-lg font-semibold text-foreground"
            >
              Connect social account
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Choose the account you want to connect.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {providerConfig.map((item) => {
            const Icon = item.icon
            const isSelected = selectedProvider === item.id
            const isConnected = connections.some(
              (connection) =>
                connection.sourceId === `social:${item.id}` &&
                connection.status !== 'disconnected',
            )

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedProvider(item.id)
                  setError(null)
                }}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">
                      {item.label}
                    </p>

                    {isConnected && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <Check className="h-3 w-3" />
                        Connected
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div
                  className={`h-4 w-4 rounded-full border ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/40'
                  }`}
                />
              </button>
            )
          })}

          {selectedConfig && (
            <div className="mt-4 rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2">
                <selectedConfig.icon className="h-4 w-4" />

                <span className="text-sm font-medium text-foreground">
                  {selectedConfig.label}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                You will only share the information permitted by the
                connection.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConnect}
            disabled={!selectedProvider || isConnecting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {isConnecting ? 'Connecting...' : 'Connect account'}
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import {
  Check,
  ExternalLink,
  Globe2,
  Link2,
  Loader2,
  Music2,
  RefreshCw,
  Unplug,
} from 'lucide-react'

import { ConnectSocialAccountModal } from '@/components/social/connect-social-account-modal'

type ProviderId =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'spotify'

type Provider = {
  id: ProviderId
  label: string
  description: string
  icon: typeof Globe2
  auth?: 'facebook'
}

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

const providers: Provider[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    description: 'Pages and permitted engagement signals.',
    icon: Globe2,
    auth: 'facebook',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'Business profile and permitted activity.',
    icon: Globe2,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Professional interests and learning themes.',
    icon: Link2,
  },
  {
    id: 'x',
    label: 'X',
    description: 'Public conversations and topics you choose.',
    icon: ExternalLink,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    description: 'Watch themes and channel activity.',
    icon: Globe2,
  },
  {
    id: 'spotify',
    label: 'Spotify',
    description: 'Artists, genres, and listening activity.',
    icon: Music2,
  },
]

const fetcher = async (url: string): Promise<{ connections?: Connection[] }> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to load connected accounts.')
  }

  return response.json()
}

export function ConnectedAccounts() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderId | null>(null)
  const [busy, setBusy] = useState<ProviderId | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const { data, error, mutate, isLoading } = useSWR(
    '/api/data-sources',
    fetcher,
  )

  const connections = data?.connections ?? []

  const socialConnections = useMemo(
    () =>
      connections.filter((connection) =>
        connection.sourceId.startsWith('social:'),
      ),
    [connections],
  )

  const connectionFor = (providerId: ProviderId) =>
    socialConnections.find(
      (connection) =>
        connection.sourceId === `social:${providerId}` &&
        connection.status !== 'disconnected',
    )

  const openConnectModal = (providerId: ProviderId) => {
    setMessage(null)
    setSelectedProvider(providerId)
    setModalOpen(true)
  }

  const handleRefresh = async (providerId: ProviderId) => {
    const connection = connectionFor(providerId)

    if (!connection) {
      openConnectModal(providerId)
      return
    }

    try {
      setMessage(null)
      setBusy(providerId)

      const response = await fetch('/api/data-sources/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connection.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to refresh this account.')
      }

      await mutate()
      setMessage(`${providers.find((p) => p.id === providerId)?.label ?? 'Account'} refreshed successfully.`)
    } catch (refreshError) {
      setMessage(
        refreshError instanceof Error
          ? refreshError.message
          : 'Unable to refresh this account.',
      )
    } finally {
      setBusy(null)
    }
  }

  const handleDisconnect = async (providerId: ProviderId) => {
    const connection = connectionFor(providerId)

    if (!connection) {
      return
    }

    try {
      setMessage(null)
      setBusy(providerId)

      const response = await fetch('/api/data-sources', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connection.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to disconnect this account.')
      }

      await mutate()

      setMessage(
        `${providers.find((p) => p.id === providerId)?.label ?? 'Account'} disconnected.`,
      )
    } catch (disconnectError) {
      setMessage(
        disconnectError instanceof Error
          ? disconnectError.message
          : 'Unable to disconnect this account.',
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Connected accounts
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Connect your social accounts to give Rate My Life the data it needs
          to analyze your digital life.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load your connected accounts. Please try again.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => {
          const Icon = provider.icon
          const connection = connectionFor(provider.id)
          const isConnected = Boolean(connection)
          const isBusy = busy === provider.id

          const accountName =
            connection?.metadata?.accountName ??
            connection?.metadata?.username

          return (
            <div
              key={provider.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground">
                      {provider.label}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {provider.description}
                    </p>

                    {isConnected && accountName && (
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        Connected as {accountName}
                      </p>
                    )}
                  </div>
                </div>

                {isConnected && (
                  <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <Check className="h-3.5 w-3.5" />
                    Connected
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!isConnected ? (
                  <button
                    type="button"
                    onClick={() => openConnectModal(provider.id)}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Connect
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleRefresh(provider.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}

                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDisconnect(provider.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Unplug className="h-4 w-4" />
                      )}

                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ConnectSocialAccountModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)

          if (!open) {
            setSelectedProvider(null)
          }
        }}
        provider={selectedProvider}
        connections={socialConnections}
        onConnected={() => {
          void mutate()
          setMessage('Social account connected successfully.')
          setModalOpen(false)
          setSelectedProvider(null)
        }}
      />
    </section>
  )
}
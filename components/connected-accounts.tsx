'use client'

import { useState } from 'react'
import useSWR from 'swr'
import {
  Check,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Music2,
  RefreshCw,
  Unplug,
  X,
  Youtube,
} from 'lucide-react'

import { ConnectSocialAccountModal } from '@/components/social/connect-social-account-modal'

type ProviderId =
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'x'
  | 'youtube'
  | 'spotify'

type Connection = {
  id: string
  sourceId: string
  status: string
  metadata?: {
    accountName?: string
    username?: string
    avatarUrl?: string
    lastSyncedAt?: string
  }
}

type DataSourcesResponse = {
  connections?: Connection[]
}

type Provider = {
  id: ProviderId
  label: string
  description: string
  icon: typeof Facebook
}

const fetcher = async (
  url: string
): Promise<DataSourcesResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to load connections')
  }

  return response.json()
}

const providers: Provider[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    description:
      'Pages and permitted engagement signals.',
    icon: Facebook,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description:
      'Business profile and permitted activity.',
    icon: Instagram,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description:
      'Professional interests and learning themes.',
    icon: Linkedin,
  },
  {
    id: 'x',
    label: 'X',
    description:
      'Public conversations and topics you choose.',
    icon: X,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    description:
      'Watch themes and channel activity.',
    icon: Youtube,
  },
  {
    id: 'spotify',
    label: 'Spotify',
    description:
      'Artists, genres, and listening activity.',
    icon: Music2,
  },
]

export function ConnectedAccounts() {
  const {
    data,
    mutate,
    isLoading,
    error: loadError,
  } = useSWR<DataSourcesResponse>(
    '/api/data-sources',
    fetcher
  )

  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] =
    useState<ProviderId | null>(null)

  const connections = data?.connections ?? []

  const connectionFor = (
    providerId: ProviderId
  ): Connection | undefined => {
    return connections.find(
      (connection) =>
        connection.sourceId ===
          `social:${providerId}` &&
        connection.status !== 'disconnected'
    )
  }

  const socialConnections = connections
    .filter(
      (connection) =>
        connection.sourceId.startsWith('social:') &&
        connection.status !== 'disconnected'
    )
    .map((connection) => ({
      id: connection.id,
      provider: connection.sourceId.replace(
        /^social:/,
        ''
      ) as ProviderId,
      status: connection.status,
      accountName:
        connection.metadata?.accountName,
      username:
        connection.metadata?.username,
      avatarUrl:
        connection.metadata?.avatarUrl,
    }))

  const openConnectModal = (
    providerId: ProviderId
  ) => {
    setSelectedProvider(providerId)
    setMessage('')
    setModalOpen(true)
  }

  const disconnect = async (
    connectionId: string,
    label: string
  ) => {
    setBusy(connectionId)
    setMessage('')

    try {
      const response = await fetch(
        '/api/data-sources',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            connectionId,
          }),
        }
      )

      const body = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          body?.error ??
            `Could not disconnect ${label}`
        )
      }

      await mutate()

      setMessage(`${label} disconnected.`)
    } catch {
      setMessage(
        `We could not disconnect ${label}. Please try again.`
      )
    } finally {
      setBusy('')
    }
  }

  return (
    <>
      <section
        className="settings-section connected-accounts"
        aria-labelledby="connected-accounts-title"
      >
        <div className="section-heading">
          <div>
            <span className="section-icon">
              <Unplug size={18} />
            </span>

            <h2 id="connected-accounts-title">
              Connected accounts
            </h2>

            <p>
              Connect social accounts with official
              authorization. Passwords and tokens never
              appear here.
            </p>
          </div>
        </div>

        {isLoading && (
          <div
            className="connected-account-loading"
            role="status"
          >
            <Loader2
              size={18}
              className="spin"
            />
            Loading connected accounts…
          </div>
        )}

        {loadError && (
          <div
            className="connected-account-error"
            role="alert"
          >
            We couldn't load your connected accounts.
            Please refresh and try again.
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="connected-account-list">
            {providers.map((provider) => {
              const Icon = provider.icon
              const connection =
                connectionFor(provider.id)

              const isDisconnecting =
                busy === connection?.id

              const isConnecting =
                busy === provider.id

              return (
                <article
                  className="connected-account-card"
                  key={provider.id}
                >
                  <div className="connected-account-icon">
                    <Icon size={19} />
                  </div>

                  <div className="connected-account-copy">
                    <strong>
                      {provider.label}
                    </strong>

                    <span>
                      {connection ? (
                        <>
                          <Check size={13} />

                          Connected ·{' '}
                          {connection.metadata
                            ?.lastSyncedAt
                            ? 'synced recently'
                            : 'ready to sync'}
                        </>
                      ) : (
                        provider.description
                      )}
                    </span>
                  </div>

                  {connection ? (
                    <button
                      type="button"
                      className="account-action disconnect-action"
                      disabled={isDisconnecting}
                      onClick={() =>
                        disconnect(
                          connection.id,
                          provider.label
                        )
                      }
                    >
                      {isDisconnecting
                        ? 'Disconnecting…'
                        : 'Disconnect'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="account-action"
                      disabled={isConnecting}
                      onClick={() =>
                        openConnectModal(
                          provider.id
                        )
                      }
                    >
                      {isConnecting ? (
                        <>
                          <Loader2
                            size={13}
                            className="spin"
                          />
                          Connecting…
                        </>
                      ) : (
                        <>
                          Connect
                          <ExternalLink
                            size={13}
                          />
                        </>
                      )}
                    </button>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {message && (
          <p
            className="connected-account-status"
            role="status"
          >
            {message}
          </p>
        )}

        <p className="connected-account-note">
          <RefreshCw size={14} />
          Connections are scoped to your account and
          can be disconnected at any time.
        </p>
      </section>

      <ConnectSocialAccountModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)

          if (!open) {
            setSelectedProvider(null)
          }
        }}
        providers={
          selectedProvider
            ? [selectedProvider]
            : providers.map(
                (provider) => provider.id
              )
        }
        connections={socialConnections}
        onConnected={() => {
          void mutate()
          setModalOpen(false)
          setSelectedProvider(null)
          setMessage(
            'Social account connected successfully.'
          )
        }}
      />
    </>
  )
}
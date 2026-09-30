'use client'

import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Facebook,
  Globe2,
  Instagram,
  Link2,
  Linkedin,
  Loader2,
  ShieldCheck,
  X,
  Youtube,
} from 'lucide-react'

type Provider = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube'

type Connection = {
  id: string
  provider: Provider
  accountName?: string | null
  username?: string | null
  avatarUrl?: string | null
  status?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected?: (connection: Connection) => void
  providers?: Provider[]
  connections?: Connection[]
}

type ProviderConfig = {
  name: string
  description: string
  icon: typeof Globe2
  configured: boolean
}

const configs: Record<Provider, ProviderConfig> = {
  facebook: {
    name: 'Facebook',
    description: 'Connect your Facebook account',
    icon: Facebook,
    configured: true,
  },

  instagram: {
    name: 'Instagram',
    description: 'Connect your Instagram account',
    icon: Instagram,
    configured: false,
  },

  linkedin: {
    name: 'LinkedIn',
    description: 'Connect your LinkedIn account',
    icon: Linkedin,
    configured: false,
  },

  x: {
    name: 'X',
    description: 'Connect your X account',
    icon: X,
    configured: false,
  },

  youtube: {
    name: 'YouTube',
    description: 'Connect your YouTube channel',
    icon: Youtube,
    configured: true,
  },
}

export function ConnectSocialAccountModal({
  open,
  onOpenChange,
  onConnected,
  providers = [
    'facebook',
    'instagram',
    'linkedin',
    'x',
    'youtube',
  ],
  connections = [],
}: Props) {
  const [selected, setSelected] = useState<Provider | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'error'
  >('idle')
  const [error, setError] = useState('')

  const closeRef = useRef<HTMLButtonElement>(null)

  const config = selected ? configs[selected] : null

  const existing = selected
    ? connections.find(
        (connection) =>
          connection.provider === selected &&
          connection.status !== 'disconnected'
      )
    : undefined

  /*
   * Reset modal state whenever it closes.
   * Focus the close button whenever it opens.
   */
  useEffect(() => {
    if (!open) {
      setSelected(null)
      setStatus('idle')
      setError('')
      return
    }

    requestAnimationFrame(() => {
      closeRef.current?.focus()
    })
  }, [open])

  /*
   * Escape closes the modal unless a connection is currently starting.
   */
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        status !== 'connecting'
      ) {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, status, onOpenChange])

  if (!open) {
    return null
  }

  const connect = async () => {
    if (!selected || !config) {
      return
    }

    if (!config.configured) {
      setStatus('error')
      setError(
        `${config.name} is not configured yet. Please configure the provider first.`
      )
      return
    }

    if (existing) {
      return
    }

    setStatus('connecting')
    setError('')

    try {
      const response = await fetch(
        `/api/social/${selected}/connect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          body?.error ??
            `Unable to start ${config.name} connection`
        )
      }

      if (
        !body ||
        typeof body.authorizationUrl !== 'string' ||
        !body.authorizationUrl
      ) {
        throw new Error(
          'The connection service returned an invalid authorization URL.'
        )
      }

      /*
       * Redirect the browser to the OAuth provider.
       */
      window.location.assign(body.authorizationUrl)
    } catch (caught) {
      setStatus('error')

      setError(
        caught instanceof Error
          ? caught.message
          : 'Unable to connect. Please try again.'
      )
    }
  }

  const handleProviderSelect = (provider: Provider) => {
    setSelected(provider)
    setStatus('idle')
    setError('')
  }

  const handleBack = () => {
    if (status === 'connecting') return

    setSelected(null)
    setStatus('idle')
    setError('')
  }

  return (
    <div
      className="social-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          status !== 'connecting'
        ) {
          onOpenChange(false)
        }
      }}
    >
      <section
        className="social-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="social-modal-title"
      >
        {/* Header */}
        <div className="social-modal-header">
          <div>
            <span className="landing-eyebrow">
              SOCIAL SIGNALS
            </span>

            <h2 id="social-modal-title">
              {config
                ? `Connect ${config.name}`
                : 'Connect your social accounts'}
            </h2>

            <p>
              {config
                ? `${config.description} to bring your digital life into Rate My Life.`
                : 'Connect your accounts to bring your digital life into Rate My Life.'}
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="connect-dialog-close"
            onClick={() => onOpenChange(false)}
            disabled={status === 'connecting'}
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Selected provider */}
        {config ? (
          <div className="social-confirmation">
            <button
              type="button"
              className="social-back"
              onClick={handleBack}
              disabled={status === 'connecting'}
            >
              <ArrowLeft size={15} />
              All providers
            </button>

            <div className="social-selected">
              <span className="social-provider-icon">
                {(() => {
                  const Icon = config.icon
                  return <Icon size={22} />
                })()}
              </span>

              <div>
                <strong>{config.name}</strong>
                <span>{config.description}</span>
              </div>
            </div>

            {/* Already connected */}
            {existing ? (
              <div className="social-success">
                <Check size={20} />

                <div>
                  <strong>Already connected</strong>

                  <p>
                    {existing.accountName ??
                      existing.username ??
                      config.name}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Permission information */}
                <div className="social-permission">
                  <ShieldCheck size={18} />

                  <div>
                    <strong>
                      Why do we need access?
                    </strong>

                    <p>
                      Rate My Life uses permitted account
                      information to generate your Life Score
                      and insights. Your password is never
                      entered here.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {status === 'error' && (
                  <div
                    className="social-error"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                {/* Connect */}
                <button
                  type="button"
                  className="social-continue"
                  onClick={connect}
                  disabled={
                    status === 'connecting' ||
                    !config.configured
                  }
                >
                  {status === 'connecting' ? (
                    <>
                      <Loader2
                        className="spin"
                        size={16}
                      />
                      Connecting securely…
                    </>
                  ) : (
                    <>
                      Continue with {config.name}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {!config.configured && (
                  <p className="social-coming">
                    {config.name} is not configured yet.
                    Please configure the OAuth credentials
                    before connecting this provider.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          /* Provider list */
          <div className="social-provider-list">
            {providers.map((provider) => {
              const item = configs[provider]
              const Icon = item.icon

              const connection = connections.find(
                (connection) =>
                  connection.provider === provider &&
                  connection.status !== 'disconnected'
              )

              const connected = Boolean(connection)

              return (
                <button
                  type="button"
                  className="social-provider-card"
                  key={provider}
                  onClick={() =>
                    handleProviderSelect(provider)
                  }
                >
                  <span className="social-provider-icon">
                    <Icon size={20} />
                  </span>

                  <span>
                    <strong>{item.name}</strong>

                    <small>
                      {connected
                        ? `Connected as ${
                            connection?.accountName ??
                            connection?.username ??
                            'account'
                          }`
                        : item.description}
                    </small>
                  </span>

                  {connected ? (
                    <Check
                      className="social-card-check"
                      size={17}
                      aria-label="Connected"
                    />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="social-modal-footer">
          <ShieldCheck size={14} />
          <span>
            You stay in control. Connections are private by
            default.
          </span>
        </div>
      </section>
    </div>
  )
}
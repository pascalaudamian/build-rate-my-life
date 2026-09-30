'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CalendarDays,
  Check,
  ExternalLink,
  FileUp,
  Loader2,
  Music2,
  X,
} from 'lucide-react'

type Source = {
  id: string
  label: string
  description: string
}

type ConnectionMethod = {
  id: string
  label: string
  description: string
  icon: typeof Music2
  type: 'oauth' | 'upload'
}

type ConnectDialogProps = {
  source: Source
  onClose: () => void
  onConnected: () => void
}

const MAX_FILE_SIZE = 8 * 1024 * 1024

const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/calendar',
  'text/csv',
  'application/json',
]

const ALLOWED_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ics',
  '.csv',
  '.json',
]

export function ConnectDialog({
  source,
  onClose,
  onConnected,
}: ConnectDialogProps) {
  const [connecting, setConnecting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  const closeRef = useRef<HTMLButtonElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const methods: ConnectionMethod[] =
    source.id === 'spotify'
      ? [
          {
            id: 'spotify',
            label: 'Spotify account',
            description:
              'Import artists, genres, and listening activity.',
            icon: Music2,
            type: 'oauth',
          },
        ]
      : source.id === 'calendar'
        ? [
            {
              id: 'google-calendar',
              label: 'Google Calendar',
              description:
                'Import event patterns and free-time signals.',
              icon: CalendarDays,
              type: 'oauth',
            },
            {
              id: 'apple-calendar',
              label: 'Apple Calendar export',
              description:
                'Upload an .ics file from your calendar app.',
              icon: CalendarDays,
              type: 'upload',
            },
          ]
        : [
            {
              id: 'upload',
              label: 'Upload selected data',
              description:
                'Choose an export or file you want to analyze.',
              icon: FileUp,
              type: 'upload',
            },
          ]

  const selected = methods.find(
    (method) => method.id === selectedMethod
  )

  /*
   * Focus the close button when the dialog opens.
   */
  useEffect(() => {
    requestAnimationFrame(() => {
      closeRef.current?.focus()
    })
  }, [])

  /*
   * Allow Escape to close the dialog.
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !connecting
      ) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      )
    }
  }, [connecting, onClose])

  const validateFile = (selectedFile: File) => {
    if (selectedFile.size > MAX_FILE_SIZE) {
      return 'The selected file is larger than 8 MB.'
    }

    const fileName = selectedFile.name.toLowerCase()

    const validExtension = ALLOWED_EXTENSIONS.some(
      (extension) => fileName.endsWith(extension)
    )

    const validMimeType =
      !selectedFile.type ||
      ALLOWED_FILE_TYPES.includes(selectedFile.type)

    if (!validExtension || !validMimeType) {
      return 'This file type is not supported.'
    }

    return null
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] ?? null

    setError('')

    if (!selectedFile) {
      setFile(null)
      return
    }

    const validationError =
      validateFile(selectedFile)

    if (validationError) {
      setFile(null)
      setError(validationError)

      /*
       * Reset the input so selecting the same invalid
       * file again triggers onChange.
       */
      event.target.value = ''

      return
    }

    setFile(selectedFile)
  }

  const handleMethodSelect = (
    method: ConnectionMethod
  ) => {
    if (connecting) return

    setSelectedMethod(method.id)
    setError('')

    if (method.type !== 'upload') {
      setFile(null)

      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }

  const connect = async () => {
    if (!selected) {
      setError('Choose a connection method first.')
      return
    }

    if (selected.type === 'upload' && !file) {
      setError('Choose a file first.')
      return
    }

    setConnecting(true)
    setError('')

    try {
      /*
       * File upload flow
       */
      if (selected.type === 'upload') {
        if (!file) {
          throw new Error('Choose a file first.')
        }

        const form = new FormData()
        form.set('file', file)
        form.set('sourceId', source.id)
        form.set('provider', selected.id)

        const upload = await fetch('/api/uploads', {
          method: 'POST',
          body: form,
        })

        const body = await upload
          .json()
          .catch(() => null)

        if (!upload.ok) {
          throw new Error(
            body?.error ?? 'Upload failed.'
          )
        }

        onConnected()
        return
      }

      /*
       * OAuth connection flow
       */
      const response = await fetch(
        '/api/data-sources',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sourceId: source.id,
            provider: selected.id,
          }),
        }
      )

      const body = await response
        .json()
        .catch(() => null)

      if (!response.ok) {
        throw new Error(
          body?.error ?? 'Connection failed.'
        )
      }

      /*
       * If the backend returns an OAuth URL,
       * redirect the browser to it.
       */
      if (
        typeof body?.authorizationUrl ===
          'string' &&
        body.authorizationUrl
      ) {
        window.location.assign(
          body.authorizationUrl
        )

        return
      }

      /*
       * Otherwise assume the backend completed
       * the connection itself.
       */
      onConnected()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div
      className="connect-dialog-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !connecting
        ) {
          onClose()
        }
      }}
    >
      <section
        className="connect-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connect-dialog-title"
      >
        {/* Header */}
        <div className="connect-dialog-header">
          <div>
            <span className="landing-eyebrow">
              CONNECT SOURCE
            </span>

            <h2 id="connect-dialog-title">
              Connect {source.label}
            </h2>

            <p>
              {source.description} Choose how you want
              to bring this signal into your private
              report.
            </p>
          </div>

          <button
            ref={closeRef}
            type="button"
            className="connect-dialog-close"
            onClick={onClose}
            disabled={connecting}
            aria-label="Close dialog"
          >
            <X size={17} />
          </button>
        </div>

        {/* Connection methods */}
        <div
          className="connect-options"
          role="radiogroup"
          aria-label="Connection method"
        >
          {methods.map((method) => {
            const Icon = method.icon
            const isSelected =
              selectedMethod === method.id

            return (
              <button
                type="button"
                className={`connect-option ${
                  isSelected ? 'selected' : ''
                }`}
                key={method.id}
                onClick={() =>
                  handleMethodSelect(method)
                }
                disabled={connecting}
                role="radio"
                aria-checked={isSelected}
              >
                <span className="connect-option-icon">
                  <Icon size={18} />
                </span>

                <span>
                  <strong>{method.label}</strong>

                  <small>
                    {method.description}
                  </small>
                </span>

                {isSelected ? (
                  <Check size={17} />
                ) : (
                  <ExternalLink size={15} />
                )}
              </button>
            )
          })}
        </div>

        {/* File upload */}
        {selected?.type === 'upload' && (
          <div className="connect-file">
            <input
              ref={fileRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
              disabled={connecting}
            />

            <small>
              {file
                ? `${file.name} · ${(
                    file.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB`
                : 'PNG, JPG, WebP, ICS, CSV, or JSON · max 8 MB'}
            </small>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="connect-dialog-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="connect-dialog-footer">
          <button
            type="button"
            className="cancel"
            onClick={onClose}
            disabled={connecting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm"
            onClick={connect}
            disabled={
              !selectedMethod || connecting
            }
          >
            {connecting ? (
              <>
                <Loader2
                  size={16}
                  className="spin"
                />
                Connecting…
              </>
            ) : (
              'Continue securely'
            )}
          </button>
        </div>
      </section>
    </div>
  )
}

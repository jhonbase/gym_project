import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AlertMessage from '../../components/AlertMessage.jsx'

describe('AlertMessage', () => {

  it('no debe renderizar nada si no hay mensaje', () => {
    const { container } = render(<AlertMessage />)
    expect(container.firstChild).toBeNull()
  })

  it('debe renderizar el mensaje de error', () => {
    render(<AlertMessage type="error" message="Algo salió mal" />)
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument()
  })

  it('debe renderizar el mensaje de éxito', () => {
    render(<AlertMessage type="success" message="¡Operación exitosa!" />)
    expect(screen.getByText('¡Operación exitosa!')).toBeInTheDocument()
  })

  it('debe aplicar la clase CSS correcta según el tipo', () => {
    const { container } = render(<AlertMessage type="warning" message="Cuidado" />)
    expect(container.firstChild).toHaveClass('alert-warning')
  })

  it('debe mostrar botón de cerrar si hay callback onClose', () => {
    const onClose = vi.fn()
    render(<AlertMessage type="error" message="Error" onClose={onClose} />)

    const closeBtn = screen.getByText('✕')
    expect(closeBtn).toBeInTheDocument()
  })

  it('debe llamar onClose al hacer click en cerrar', () => {
    const onClose = vi.fn()
    render(<AlertMessage type="error" message="Error" onClose={onClose} />)

    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no debe mostrar botón de cerrar si no hay onClose', () => {
    render(<AlertMessage type="error" message="Error sin close" />)
    expect(screen.queryByText('✕')).not.toBeInTheDocument()
  })
})

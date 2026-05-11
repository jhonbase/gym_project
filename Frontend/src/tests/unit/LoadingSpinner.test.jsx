import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import LoadingSpinner from '../../components/LoadingSpinner.jsx'

describe('LoadingSpinner', () => {

  it('debe renderizar el contenedor del spinner', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.loading-container')).toBeInTheDocument()
  })

  it('debe renderizar el elemento spinner animado', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('.ui-spinner')).toBeInTheDocument()
  })
})

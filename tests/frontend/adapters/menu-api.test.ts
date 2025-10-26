import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'

import { fetchMenus } from '../../../src/lib/api/menu'
import * as apiClient from '../../../src/lib/api-client'

describe('menu API adapter', () => {
  afterEach(() => {
    mock.restoreAll()
  })

  it('delegates to apiFetch with the menus endpoint', async () => {
    const response = { menus: [] }
    const fetchMock = mock.method(apiClient, 'apiFetch', async () => response)

    const result = await fetchMenus()

    assert.equal(fetchMock.mock.calls[0].arguments[0], '/menus')
    assert.equal(result, response)
  })
})

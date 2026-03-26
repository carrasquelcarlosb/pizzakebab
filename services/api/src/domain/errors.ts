export class CartNotFoundError extends Error {
  constructor(message = 'Cart not found') {
    super(message);
    this.name = 'CartNotFoundError';
  }
}

export class CartClosedError extends Error {
  constructor(message = 'Cart is no longer active') {
    super(message);
    this.name = 'CartClosedError';
  }
}

export class CartUpdateError extends Error {
  constructor(message = 'Failed to update cart') {
    super(message);
    this.name = 'CartUpdateError';
  }
}

export class OrderSubmissionError extends Error {
  constructor(message = 'Unable to submit order') {
    super(message);
    this.name = 'OrderSubmissionError';
  }
}

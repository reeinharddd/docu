/**
 * Error taxonomy for the IA module. Every error carries an actionable
 * message: what failed, which variable or contract is involved, and what
 * to change. Nothing fails silently (brief #85, RNF-01).
 */

export class IaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IaError'
  }
}

export class ConfigError extends IaError {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigError'
  }
}

export class EngineError extends IaError {
  constructor(
    message: string,
    readonly engine: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'EngineError'
  }
}

export class BudgetExceededError extends IaError {
  constructor(
    readonly limitKind: 'tokens' | 'time',
    readonly limit: number,
    readonly observed: number,
  ) {
    super(
      `IA budget exceeded (${limitKind}): limit ${limit}, observed ${observed}. ` +
        'Raise IA_BUDGET_MAX_TOKENS / IA_BUDGET_MAX_MS or route this work to quarantine with a reason.',
    )
    this.name = 'BudgetExceededError'
  }
}

export class ContractViolationError extends IaError {
  constructor(message: string) {
    super(message)
    this.name = 'ContractViolationError'
  }
}
